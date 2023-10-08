<script setup>
import { store } from '@/data/store.js';
import { ref } from 'vue';
import Avatar from './Avatar.vue';
const users = ref(store.appState.users);
console.log(users);
</script>

<template>
	<div class="user-grid-wrapper">
		<h2>Volunteers</h2>
		<div class="user-grid">
			<Avatar v-for="user in users" :user="user">{{ user.name }}></Avatar>
		</div>
	</div>
</template>

<style scoped>
.user-grid-wrapper {
	border: var(--border-width) solid var(--color-ui);
	padding: var(--space-sm);
}
.user-grid {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}
</style>
