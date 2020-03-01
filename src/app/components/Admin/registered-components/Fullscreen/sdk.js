import fs from 'fullscrn';

class Fullscreen {
    constructor(element) {
        this.element = element || document.body;

        this.update = () => {
            document.body.classList.remove('fullscreen');

            if (!this) {
                document.removeEventListener('fullscreenchange', this.update);
                return;
            }

            if (document.fullscreen) {
                document.body.classList.add('fullscreen');
            }
        };

        document.addEventListener('fullscreenchange', this.update);
    }

    isExpanded = () => document.fullscreen;

    isCollapsed = () => !document.fullscreen;

    collapse = () => document.exitFullscreen();

    expand = async () => this.element.requestFullscreen();

    toggle = () => (this.isExpanded() ? this.collapse() : this.expand());
}

export default Fullscreen;
