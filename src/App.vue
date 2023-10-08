<script setup>
import Event from './components/Event.vue';
import UserGrid from './components/UserGrid.vue';

import { store } from '@/data/store.js';
</script>

<template>
	<div class="layout">
		<div class="events">
			<Event v-for="event in store.appState.events" :event="event" />
		</div>
	</div>
</template>

<style scoped>
.layout {
	max-width: 60rem;
	margin: 0 auto;
	padding: 6rem 2rem;
}
.events {
	display: grid;
	gap: 4rem;
}
</style>
