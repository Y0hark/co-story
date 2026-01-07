
import fetch from 'node-fetch';

async function checkModels() {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();

        // Log first few models to see structure
        console.log(JSON.stringify(data.data.slice(0, 3), null, 2));

        // Check if there is any status field?
        const hasStatus = data.data.some((m: any) => m.status || m.availability);
        console.log("Has explicit status field:", hasStatus);

    } catch (e) {
        console.error(e);
    }
}

checkModels();
