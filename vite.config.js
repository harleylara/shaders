import fs from "fs";
import path from "path"
import { globSync } from 'glob';

export default {
   plugins: [
    {
      name: 'watch-pattern-matching-files',
      configureServer(server) {
        // Define your glob pattern(s)
        const patterns = [
          './*.glsl',
        ];

        // Match files for each pattern
        const matchedFiles = patterns.flatMap(pattern =>
          globSync(pattern, { cwd: __dirname, absolute: true })
        );

        matchedFiles.forEach(filePath => {
          fs.watchFile(filePath, { interval: 100 }, () => {
            console.log(`[Vite Plugin] Change detected in ${filePath}, reloading...`);
            server.ws.send({ type: 'full-reload'});
          });
        });
      },
    },
  ],
  // server: {
  //   watch: {
  //     usePolling: true,
  //     interval: 100
  //   }
  // }
}
