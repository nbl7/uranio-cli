declare const _default: {
    init: (root: string, repo: "web" | "core" | "ntl", options: Partial<import("./types").Options>) => Promise<void>;
    transpose: (root: string, options?: Partial<import("./types").Options> | undefined) => Promise<void>;
    alias: (options?: Partial<import("./types").Options> | undefined) => void;
};
export default _default;
