<template>
	<button class="avatar" @click="showModal"><img :src="user.avatar" :alt="user.name" /></button>
	<dialog ref="modal">
		<div class="modal-content">
			<div class="user-header">
				<img :src="user.avatar" :alt="user.name" />
				<h3>{{ user.name }}</h3>
			</div>
			<div class="roles">
				<div class="role" v-for="(role, i) in editableUser.roles">
					<div class="title"><RoleIcon :role="role.role" /> {{ role.role }}</div>
					<div class="role-inputs">
						<div class="role-input">
							<label>Experience</label>
							<div class="form-row">
								<label>Low</label>
								<input type="range" min="1" max="5" v-model="editableUser.roles[i].skill" />
								<label>High</label>
							</div>
						</div>
						<div class="role-input">
							<label>Preference</label>
							<div class="form-row">
								<label>Less</label>
								<input type="range" min="1" max="5" v-model="editableUser.roles[i].want" />
								<label>More</label>
							</div>
						</div>
					</div>
				</div>
			</div>
			<label for="date">Blackout Dates:</label>
			<div class="blackout-dates">
				<form class="input-row" @submit.prevent="addBlackoutDate">
					<input name="date" type="date" required />
					<button title="Add a new Blackout Date">+</button>
				</form>
				<div class="pills">
					<button class="pill" :data-date="date" @click="removeBlackoutDate" v-for="date in editableUser.blackoutDates">
						✖ {{ date }}
					</button>
				</div>
			</div>
			<form class="close" method="dialog">
				<button>Close</button>
			</form>
		</div>
	</dialog>
</template>
<script setup>
import { ref } from 'vue';
import { store } from '@/data/store.js';
import RoleIcon from './RoleIcon.vue';

const props = defineProps({
	user: Object,
});

const editableUser = ref(store.appState.users.find((u) => u.id == props.user.id));

const addBlackoutDate = (e) => {
	const { date } = Object.fromEntries(new FormData(e.target));
	editableUser.value.blackoutDates.push(date);
	editableUser.value.blackoutDates.sort();
};

const removeBlackoutDate = (e) => {
	editableUser.value.blackoutDates = [...editableUser.value.blackoutDates].filter((d) => d !== e.target.dataset.date);
};

const modal = ref();
const showModal = () => {
	modal.value.showModal();
	console.log(editableUser.value);
};
</script>
<style lang="scss" scoped>
.avatar {
	all: unset;
	box-sizing: border-box;
	cursor: pointer;
	display: block;
	overflow: hidden;
	height: 2rem;
	width: 2rem;
	border-radius: 50%;
}
dialog {
	border: var(--border-width) solid var(--color-ui-muted);
	border-radius: var(--border-radius);
	color: var(--color-text);
	background: var(--color-background-card);
	margin: auto;
	padding: var(--space-sm);
	max-width: calc(100% - var(--space-md));
	max-height: calc(100% - var(--space-md));
}
dialog::backdrop {
	background: rgba(0, 0, 0, 0.8);
}
.modal-content {
	max-width: 24rem;
}
.user-header {
	display: grid;
	grid-template-columns: 3rem 1fr;
	align-items: center;
	gap: 0.5rem;
	img {
		border-radius: 50%;
		border: var(--border-width) solid var(--color-ui);
	}
	h3 {
		margin: 0;
	}
}
.roles {
	display: grid;
	gap: 1.5rem;
	margin: 1.5rem 0;
}
.role {
	.title {
		font-weight: 800;
	}
}
.role-input > label {
	margin: 0.5rem 0 0.25rem 0;
}
.role-inputs {
	display: grid;
	grid-template-columns: 8rem 8rem;
	gap: 1rem;

	.form-row {
		gap: 0.25rem;
		label {
			color: var(--color-text-muted);
			width: max-content;
			font-size: 0.7rem;
		}
	}
}
.blackout-dates {
	border: var(--border-width) solid var(--color-ui);
	border-radius: var(--border-radius);
	padding: 0.5rem 0.75rem;
}
.pills {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}
.pill {
	font-size: 0.7rem;
	height: unset;
	padding: 0.25rem 0.5rem;
	--button-background: var(--color-ui);
	&:hover {
		--button-background: var(--color-ui-intense);
	}
}
.close {
	margin-top: 1rem;
}
</style>
