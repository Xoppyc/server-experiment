export default function bodyParser(req: any): Promise<any> {
  // Creating new promise to make code wait for it to parse before showing it to handler
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    // concat chunks of data
    req.on('data', (chunk: any) => {
      chunks.push(chunk);
      // checking if boddy is too big, if it is, destroy the connection to prevent DoS attack
      if (Buffer.byteLength(Buffer.concat(chunks)) > 1e6) { // >1MB
        req.connection.destroy();
        reject(new Error('Request body too large (>1MB)'));
      }
    });

    // when request ends check for response type and parse accordingly
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      try {
        // content == json ? parse it or if it throws exception return empty string 
        // (happens when request is empty string) : return as string. if body is empty,
        //  return empty string instead of null
        const parsed = req.headers['content-type'] === 'application/json' ?
          JSON.parse(body) || ' ' : body;
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    })
  })
}
