import bodyParser = require('body-parser');

export const jsonParser = (options?: bodyParser.OptionsJson | undefined) => bodyParser.json(options);
export const rawParser = (options?: bodyParser.Options | undefined) => bodyParser.raw(options);
export const textParser = (options?: bodyParser.OptionsText | undefined) => bodyParser.text(options);
export const urlencodedParser = (options?: bodyParser.OptionsUrlencoded | undefined) => bodyParser.urlencoded(options);