import { Config } from '@remotion/cli/config';

// 中间帧用高质量 JPEG（默认 80 会在深色渐变/毛玻璃上产生色带，再经 H.264 二压更明显）
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setX264Preset('slow');
