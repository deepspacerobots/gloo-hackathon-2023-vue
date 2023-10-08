<script setup>
import { ref } from 'vue';
import { store } from '@/data/store.js';
import RoleIcon from './RoleIcon.vue';
import Avatar from './Avatar.vue';
import UserImage from './UserImage.vue';
import OpenAI from 'openai';

const props = defineProps({
	event: Object,
});

const editableEvent = ref(store.appState.events.find((e) => e.id == props.event.id));

const assignedUserIds = editableEvent.value.roleRequirements.map((r) => r.userId);

const availableUsers = ref([...store.appState.users].filter((u) => !assignedUserIds.includes(u.id)));

const activeFilters = ref([]);

const filteredAvailableUsers = ref(availableUsers.value);

const filterUsers = (role) => {
	if (activeFilters.value.includes(role)) {
		activeFilters.value = activeFilters.value.filter((f) => f !== role);
	} else {
		activeFilters.value.push(role);
	}
	if (activeFilters.value.length) {
		filteredAvailableUsers.value = availableUsers.value.filter((u) => {
			return u.roles.find((r) => activeFilters.value.includes(r.role));
		});
	} else {
		filteredAvailableUsers.value = availableUsers.value;
	}
};

const openai = new OpenAI({
	apiKey: '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',
	dangerouslyAllowBrowser: true,
});

const aiAssign = async () => {
	const prompt = `given this event: ${JSON.stringify(props.event)}, 
  populate all event.roleRequirements[n].userId
  with user.id values from this users array: ${JSON.stringify(
		availableUsers.value.map((u) => {
			return { id: u.id, b: u.blackoutDates, roles: u.roles.map((r) => r.role) };
		})
	)}.
  Here are some guidelines:
  - event.roleRequirements[n].userId must be a user.id value from the users array, userId values must not be repeated

  - Each entry in event.roleRequrements has a role.  This role must be in the user.roles array in order for a user to be added.
  - the user you are trying to add to event.roleRequirements[n].userId must not have the event.date in its user.b array.
  - Do not generate code or prose, generate the data. Return only a JSON string.
  `;

	console.log(prompt);

	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: prompt }],
		model: 'gpt-3.5-turbo',
	});
	// console.log(chatCompletion.usage)

	if (chatCompletion.choices[0].message.content) {
		editableEvent.value = JSON.parse(chatCompletion.choices[0].message.content);
		console.log(JSON.parse(chatCompletion.choices[0].message.content));
		return JSON.parse(chatCompletion.choices[0].message.content);
	}
};

const removeUser = (evt, i) => {
	const userId = editableEvent.value.roleRequirements[i].userId;
	availableUsers.value.push(store.appState.users.find((u) => u.id == userId));
	editableEvent.value.roleRequirements[i].userId = null;
};

const startDrag = (evt, item) => {
	evt.dataTransfer.dropEffect = 'move';
	evt.dataTransfer.effectAllowed = 'move';
	evt.dataTransfer.setData('itemID', item.id);
};
const onDrop = (evt, role) => {
	const itemID = Number(evt.dataTransfer.getData('itemID'));
	const user = availableUsers.value.find((u) => u.id == itemID);
	const userRoles = user.roles.map((r) => r.role);
	if (user.blackoutDates.includes(editableEvent.date)) {
		alert(`${user.name} has requested ${editableEvent.date} off`);
	} else {
	}
	if (userRoles.includes(role.role) && !user.blackoutDates.includes(editableEvent.date)) {
		availableUsers.value = availableUsers.value.filter((u) => u.id !== itemID);
		role.userId = itemID;
	} else {
		alert(`${user.name} has the following roles: ${userRoles.join(', ')}, but not ${role.role}`);
	}
};
</script>

<template>
	<div class="event">
		<div class="event-header">
			<div class="event-title">{{ event.title }}</div>
			<div class="event-datetime">{{ event.date }}, {{ event.time }}</div>
			<button class="ai-assign" @click="aiAssign">AI Assign</button>
		</div>
		<div class="event-body">
			<div class="role-reqirements">
				<div
					class="role-requirement"
					:data-filled="role.userId ? 'true' : 'false'"
					v-for="(role, i) in editableEvent.roleRequirements"
				>
					<button class="icon" :title="`Filter users by ${role.role}`" @click="filterUsers(role.role)">
						<RoleIcon :role="role.role" />
					</button>
					<div class="user-placeholder" v-if="role.userId">
						<button class="remove-user" title="Remove User" @click="removeUser($event, i)">
							<UserImage :userId="parseInt(role.userId)" />
							<div class="icon">✖</div>
						</button>
					</div>
					<div
						v-else
						class="user-placeholder drop-zone"
						@drop="onDrop($event, role)"
						@dragover.prevent
						@dragenter.prevent
					></div>
				</div>
			</div>
			<div class="user-grid-wrapper">
				<h5>Volunteers</h5>
				<div class="user-scroll-wrapper">
					<div class="user-grid">
						<div v-for="user in filteredAvailableUsers" draggable="true" @dragstart="startDrag($event, user)">
							<Avatar :user="user"></Avatar>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.event {
	border-radius: var(--border-radius);
	border: var(--border-width) solid var(--color-ui);
}
.event-header {
	display: flex;
	gap: 0.5rem;
	align-items: flex-end;
	padding: 0.5rem 1rem;
}
.event-body {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 2rem;
	padding: 1rem;
}
.event-header {
	background: var(--color-background-card);
}
.event-title {
	font-weight: 800;
}
.event-datetime {
	font-size: 0.9rem;
	opacity: 0.8;
}
.role-reqirements {
	display: flex;
	flex-wrap: wrap;

	gap: 0.5rem;
}
.role-requirement {
	background: var(--color-ui);
	width: 6rem;
	height: 2rem;
	border-radius: 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	&[data-filled='true'] {
		background: var(--color-primary);
	}
	.icon {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		padding: 0 0.75rem;
		svg {
			width: 1.2rem;
			height: 1.2rem;
		}
	}
	.title {
		font-size: 0.6rem;
	}
	.user-placeholder {
		overflow: hidden;
		height: 2rem;
		width: 2rem;
		border: var(--border-width) solid var(--color-text);
		border-radius: 50%;
	}
}
.remove-user {
	all: unset;
	box-sizing: border-box;
	cursor: pointer;
	position: relative;
	* {
		pointer-events: none;
	}
	&:hover {
		img {
			filter: brightness(0.5);
		}
		.icon {
			opacity: 1;
		}
	}
	.icon {
		position: absolute;
		z-index: 1;
		top: -0.3rem;
		left: -0.4rem;
		font-size: 1.5rem;
		opacity: 0;
	}
}

.user-grid-wrapper {
	//border: var(--border-width) solid var(--color-ui);
	//padding: var(--space-sm);
	width: 16rem;

	flex-shrink: 0;
}
.user-scroll-wrapper {
	overflow: auto;
	height: 12rem;
}
.user-grid {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}
.ai-assign {
	margin-left: auto;
}
</style>
