// store.js
import { reactive, watch } from 'vue';
import { users } from '@/data/users.js';
import { events } from '@/data/events.js';
export const defaultAppState = {
	users: users,
	events: events,
};

const localAppState = localStorage.glooAppState ? JSON.parse(localStorage.glooAppState) : defaultAppState;

export const store = reactive({
	appState: localAppState,

	deepMerge(source, target) {
		return (
			void Object.keys(target).forEach((key) => {
				source[key] instanceof Object && target[key] instanceof Object
					? source[key] instanceof Array && target[key] instanceof Array
						? void (source[key] = Array.from(new Set(source[key].concat(target[key]))))
						: !(source[key] instanceof Array) && !(target[key] instanceof Array)
						? void this.deepMerge(source[key], target[key])
						: void (source[key] = target[key])
					: void (source[key] = target[key]);
			}) || source
		);
	},
	resetAppState() {
		this.appState = defaultAppState;
		localStorage.glooAppState = JSON.stringify({ ...defaultAppState });
	},
});

watch(
	store.appState,
	(currentValue, oldValue) => {
		localStorage.glooAppState = JSON.stringify({ ...currentValue });
	},
	{ deep: true }
);
