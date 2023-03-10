import { get } from 'svelte/store';
import { page } from '$app/stores';

import { reserved } from './constants';
import { section, sections, linkClicked } from './stores';
import { goto } from '$app/navigation';

import ScrollWatcher from './ScrollWatcher.svelte';

export { ScrollWatcher, section, sections };

export interface LinkOptions {
    onNavigate?: () => void;
    section: string;
}

export function scrollTo(node: HTMLAnchorElement, options?: LinkOptions) {
    if (!options) {
        return;
    }

    const listener = async (e: MouseEvent) => {
        e.preventDefault();

        if (options.onNavigate) {
            options.onNavigate();
        }

        if (node.href) {
            await goto(node.href);
        } else {
            await goto(get(page).url.pathname);
        }

        if (options.section === reserved.top) {
            section.set(reserved.top);
            return;
        }

        const wantedSection = get(sections).get(options.section);

        if (wantedSection) {
            wantedSection.scrollIntoView(true);
        } else {
            return;
        }

        linkClicked.set(true);
        section.set(options.section);

        return false;
    };

    node.addEventListener('click', listener);

    return {
        destroy() {
            node.removeEventListener('click', listener);
        }
    }
}

export function scrollRef(node: HTMLElement, name?: string) {
    if (!name) {
        return;
    }

    if (name[0] === '+') {
        throw new Error(`${name} is a reserved name`);
    }
    
    const currentSections = get(sections);

    if (currentSections.has(name)) {
        console.error(`Duplicate section '${name}'`);
        return;
    }

    sections.update(prev => {
        prev.set(name, node);
        return prev;
    });

    return {
        destroy() {
            sections.update(prev => {
                prev.delete(name);
                return prev;
            });  
        }
    }
}