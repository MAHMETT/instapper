/* Chrome-only extension APIs not covered by webextension-polyfill. */
declare namespace chrome {
  namespace runtime {
    function getContexts(
      filter: Record<string, unknown>,
    ): Promise<Array<Record<string, unknown>>>;
    function sendMessage(message: unknown): void;
  }
  namespace offscreen {
    function createDocument(parameters: {
      url: string;
      reasons: string[];
      justification: string;
    }): Promise<void>;
  }
}
