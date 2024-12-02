// Selected values that were globals, now set up as members of a singleton

class Common {
    constructor() {
        if (Common.instance instanceof Common) {
            // biome-ignore lint/correctness/noConstructorReturn: <explanation>
            return Common.instance;
        }
        this.loadedHTML = [];
        // Use Object.freeze(this.whatever) if you need something to stay unchanged
        Common.instance = this;
    }
}

export { Common };