import { IDynamicScripts } from '../interfaces';

export const ScriptStore: IDynamicScripts[] = [
  { name: 'oscillator', src: './assets/js/oscillator.js' },
  { name: 'jquery', src: './assets/js/jquery.js' },
  { name: 'skills', src: './assets/js/skills.js' }
];

export const MEDIUM_INTEGRATION_URL: string = '';
// 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@akashkriplani';
