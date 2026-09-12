import { mount } from 'svelte';
import { applyTheme, getStoredTheme } from '../../lib/theme';
import App from './App.svelte';
import './app.css';

// Apply stored theme before mount to avoid FOUC
applyTheme(getStoredTheme());

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app root element');

const app = mount(App, { target });

export default app;
