import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDeepgram() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    console.error('No API key');
    return;
  }
  
  console.log('Fetching projects...');
  const projRes = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${apiKey}` }
  });
  const projData = await projRes.json();
  console.log('Projects:', projData);
  
  if (projData.projects && projData.projects.length > 0) {
    const projectId = projData.projects[0].project_id;
    console.log('Project ID:', projectId);
    
    console.log('Creating key...');
    const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comment: 'mte-voice-demo-temp',
        scopes: ['member'],
        time_to_live_in_seconds: 60
      })
    });
    
    if (!keyRes.ok) {
      console.log('Key creation failed:', await keyRes.text());
    } else {
      console.log('Key creation success:', await keyRes.json());
    }
  }
}

testDeepgram();
