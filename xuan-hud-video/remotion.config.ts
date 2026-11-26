import { Config } from '@remotion/cli/config';

// 强制无损 PNG 中间帧：彻底消除 JPEG 4:2:0 色度子采样在暗黑 2px 彩色斜边上造成的块状锯齿与色带
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setX264Preset('slow');
