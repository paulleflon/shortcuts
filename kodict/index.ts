const server = Bun.serve({
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    // Other endpoints might be added in the future
    if (url.pathname === "/koen") {
      const word = url.searchParams.get("word"); // Word can be either in Korean or English
      if (!word)
        return new Response('Please provide a "word" query parameter', {
          status: 400,
        });
      let res = await fetch(
        `https://korean.dict.naver.com/api3/koen/search?query=${word}`,
        {
          headers: {
            Host: "korean.dict.naver.com",
            Referer: "https://korean.dict.naver.com/koendict/",
          },
        },
      );
      // There is no need to check the response, worst case scenario we just get empty meanings.
      const json = (await res.json()) as Record<string, any>;
      let resultString = `Meanings for ${word}:\n`;
      for (const item of json.searchResultMap.searchResultListMap.WORD.items) {
        resultString += item.meansCollector[0].partOfSpeechCode + " - ";
        resultString +=
          item.meansCollector[0].means
            .map((m: Record<string, string>) => m.value)
            .join(", ")
            .replace(/<\/?(?:\w|\d| |=|'|")+>/g, "") // Getting rid of HTML tags since Shortcuts doesn't render them
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&amp;", "&")
            .replace("&quot;", '"')
            .replace("&apos;", "'")
            .replace("&nbsp;", " ") + "\n";
      }
      console.log(`Query for ${word}`);
      // Since this is supposed to be used in an Apple Shortcut, a string is easier to work with.
      return new Response(resultString);
    }
    return new Response("Not Found", { status: 404 });
  },
});
console.log(`Server running at ${server.url}`);
