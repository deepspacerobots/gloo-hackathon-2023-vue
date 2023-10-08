<script setup>
import { store } from '@/data/store.js';

const props = defineProps({
	userId: Number,
});
const user = store.appState.users.find((u) => u.id == props.userId);
</script>

<template>
	<img class="user-image" :src="user.avatar" :alt="user.name" />
</template>

<style scoped></style>
