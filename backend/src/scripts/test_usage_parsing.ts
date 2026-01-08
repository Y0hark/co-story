
const content = `Here is the story continuation.
[[ACTION: {
"type": "append_chapter_content",
"data": {
"content": "— Ce n'est pas de tes capacités que je doute, Kariaru, reprit-il doucement.\\n\\nC'est de la nature de ta quête."
}
}]]`;

const contentUnquoted = `[[ACTION: {
type: "append_chapter_content",
data: {
content: "Some content here"
}
}]]`;

function testParse(msgContent: string) {
    console.log("Testing Content:\n", msgContent);
    let generatedWords = 0;

    // Exact Regex from aiService.ts
    const actionBlockRegex = /\[\[\s*ACTION\s*:([\s\S]*?)\]\]/gi;
    let match;
    while ((match = actionBlockRegex.exec(msgContent)) !== null) {
        const rawContent = match[1] || "";
        console.log("Match Found:", rawContent);

        try {
            const firstBrace = rawContent.indexOf('{');
            const lastBrace = rawContent.lastIndexOf('}');
            let jsonString = rawContent;
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonString = rawContent.substring(firstBrace, lastBrace + 1);
            }

            let action: any;
            try {
                action = JSON.parse(jsonString);
            } catch (e) {
                console.log("Standard parse failed");
                let fixedJson = jsonString.replace(/\n/g, '\\n');
                try {
                    action = JSON.parse(fixedJson);
                } catch (e2) {
                    console.log("Newline fix failed, trying unquoted keys");
                    fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
                    action = JSON.parse(fixedJson);
                }
            }

            if (action) {
                console.log("Action Parsed:", action.type);
                if (action.type === 'update_chapter_content' || action.type === 'append_chapter_content' || action.type === 'create_chapter') {
                    const content = action.data?.content || "";
                    const count = content.split(/\s+/).filter((w: string) => w.length > 0).length;
                    generatedWords += count;
                    console.log(`Counted ${count} words.`);
                }
            }

        } catch (e) {
            console.error("Final parse failed", e);
        }
    }
    console.log("Total generated words:", generatedWords);
}

testParse(content);
testParse(contentUnquoted);
