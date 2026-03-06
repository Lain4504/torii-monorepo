declare module '@editorjs/editorjs' {
    export type OutputData = any;
    export type API = any;
    export default class EditorJS {
        constructor(config?: any);
        destroy?(): void;
        save(): Promise<OutputData>;
        saver: {
            save(): Promise<OutputData>;
        };
    }
}
declare module '@editorjs/header';
declare module '@editorjs/list';
declare module '@editorjs/quote';
declare module '@editorjs/code';
declare module '@editorjs/delimiter';
declare module '@editorjs/table';
declare module '@editorjs/inline-code';
declare module '@editorjs/marker';
declare module '@editorjs/checklist';
declare module '@editorjs/warning';
declare module '@editorjs/paragraph';
declare module '@editorjs/image';
declare module '@editorjs/embed';
declare module '@editorjs/attaches';
declare module 'editorjs-text-alignment-blocktune';
