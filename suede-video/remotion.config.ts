import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Keep memory modest in the container; correctness over speed.
Config.setConcurrency(1);
