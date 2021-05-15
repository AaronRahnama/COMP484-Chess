// import App from './App.svelte';
import App from './Index.svelte';


const app = new App({
	target: document.body,
	// hydrate: true,
	props: {
		name: 'world'
	}
});

export default app;