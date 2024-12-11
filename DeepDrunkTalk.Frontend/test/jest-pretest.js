import 'aurelia-polyfills';
import path from 'path';
import { Options } from 'aurelia-loader-nodejs';
import {globalize} from 'aurelia-pal-nodejs';
import path from 'path';
Options.relativeToDir = path.resolve(__dirname, './unit'); 
globalize();

