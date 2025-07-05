// useArtplayer.ts
import { ref, onMounted, onUnmounted, watch, Ref, computed, MaybeRefOrGetter, toValue } from 'vue';
import Artplayer from 'artplayer';

// 从 Artplayer 实例类型中提取 Option 类型
type ArtplayerOption = InstanceType<typeof Artplayer>['option'];

// 扩展选项接口，移除 container 并添加 containerRef
interface ArtplayerOptions extends Omit<ArtplayerOption, 'container'> {
  containerRef?: Ref<HTMLDivElement | null>;
}

// 响应式选项类型 - 支持 ref、getter 或普通值
type ReactiveArtplayerOptions = Omit<
  ArtplayerOptions,
  'url' | 'volume' | 'muted' | 'playbackRate' | 'poster' | 'autoplay' | 'loop'
> & {
  // 特定的响应式选项
  url?: MaybeRefOrGetter<string>;
  volume?: MaybeRefOrGetter<number>;
  muted?: MaybeRefOrGetter<boolean>;
  playbackRate?: MaybeRefOrGetter<number>;
  poster?: MaybeRefOrGetter<string>;
  autoplay?: MaybeRefOrGetter<boolean>;
  loop?: MaybeRefOrGetter<boolean>;
  containerRef?: Ref<HTMLDivElement | null>;
};

// 手动定义 Artplayer 事件类型（根据实际 API 完善）
type ArtplayerEvents = {
  // 播放器状态事件
  ready: []; // 播放器准备就绪
  play: []; // 开始播放
  pause: []; // 暂停播放
  ended: []; // 播放结束
  waiting: []; // 等待加载
  playing: []; // 正在播放
  loadeddata: []; // 媒体数据已加载
  loadedmetadata: []; // 元数据已加载

  // 进度事件
  timeupdate: [number]; // 播放时间更新（当前时间）
  progress: [number]; // 加载进度（0-1）
  seeking: [number]; // 开始 seek
  seeked: [number]; // seek 完成

  // 错误事件
  error: [Error | string]; // 发生错误

  // 控制栏事件
  controlshow: []; // 控制栏显示
  controlhide: []; // 控制栏隐藏

  // 全屏事件
  fullscreen: [boolean]; // 全屏状态改变（是否全屏）
  fullscreenchange: [boolean]; // 全屏模式切换
  fullscreenweb: [boolean]; // Web 全屏状态改变

  // 其他事件
  volumechange: [number, boolean]; // 音量改变（[音量, 是否静音]）
  ratechange: [number]; // 播放速度改变
  resize: []; // 播放器尺寸改变
  destroy: []; // 播放器销毁
  switch: [string]; // 视频源切换
};

export function useArtplayer(options: ReactiveArtplayerOptions) {
  const playerRef = ref<Artplayer | null>(null);
  const containerRef = options.containerRef || ref<HTMLDivElement | null>(null);

  // 解析响应式选项
  const resolveOptions = (): ArtplayerOption => {
    // 创建基础选项对象，排除响应式选项
    const { url, volume, muted, playbackRate, poster, autoplay, loop, containerRef, ...baseOptions } = options;

    // 解析响应式选项
    const resolvedOptions: Record<string, unknown> = {
      ...baseOptions,
      container: containerRef?.value,
    };

    // 手动解析特定的响应式选项
    if (url !== undefined) {
      resolvedOptions.url = toValue(url);
    }
    if (volume !== undefined) {
      resolvedOptions.volume = toValue(volume);
    }
    if (muted !== undefined) {
      resolvedOptions.muted = toValue(muted);
    }
    if (playbackRate !== undefined) {
      resolvedOptions.playbackRate = toValue(playbackRate);
    }
    if (poster !== undefined) {
      resolvedOptions.poster = toValue(poster);
    }
    if (autoplay !== undefined) {
      resolvedOptions.autoplay = toValue(autoplay);
    }
    if (loop !== undefined) {
      resolvedOptions.loop = toValue(loop);
    }

    return resolvedOptions as ArtplayerOption;
  };

  // 创建播放器实例
  const createPlayer = () => {
    console.log('containerRef.value', containerRef.value);
    if (!containerRef.value) {
      setTimeout(createPlayer, 100);
      return;
    }

    const playerOptions = resolveOptions();

    try {
      playerRef.value = new Artplayer(playerOptions);
      console.log('Artplayer 实例创建成功');

      // 绑定基础事件监听
      if (playerRef.value) {
        playerRef.value.on('ready', () => {
          console.log('Artplayer 准备就绪');
        });

        playerRef.value.on('error', (event) => {
          console.error('Artplayer 错误:', event);
        });
      }
    } catch (error) {
      console.error('Artplayer 初始化失败:', error);
    }
  };

  // 销毁播放器实例
  const destroyPlayer = () => {
    if (playerRef.value) {
      playerRef.value.destroy();
      playerRef.value = null;
      console.log('Artplayer 实例已销毁');
    }
  };

  // 播放器控制方法
  const play = (): void => {
    playerRef.value?.play();
  };

  const pause = (): void => {
    playerRef.value?.pause();
  };

  const togglePlay = (): void => {
    playerRef.value?.toggle();
  };

  const seek = (time: number): void => {
    if (!playerRef.value) return;
    playerRef.value.seek = time;
  };

  const setVolume = (volume: number): void => {
    if (!playerRef.value) return;
    const validVolume = Math.max(0, Math.min(1, volume));
    playerRef.value.volume = validVolume;
  };

  const setPlaybackRate = (rate: number): void => {
    if (!playerRef.value) return;
    playerRef.value.playbackRate = rate;
  };

  const mute = (isMute: boolean): void => {
    if (!playerRef.value) return;
    playerRef.value.muted = isMute;
  };

  // 响应式状态
  const isPlaying = computed(() => playerRef.value?.playing || false);
  const duration = computed(() => playerRef.value?.duration || 0);
  const currentTime = computed(() => playerRef.value?.currentTime || 0);
  const currentVolume = computed(() => playerRef.value?.volume || 0);
  const isMutedState = computed(() => playerRef.value?.muted || false);

  // 生命周期管理
  onMounted(() => {
    createPlayer();
  });

  onUnmounted(() => {
    destroyPlayer();
  });

  // 监听响应式选项变化，处理动态更新
  watch(
    () => ({
      url: options.url ? toValue(options.url) : undefined,
      volume: options.volume ? toValue(options.volume) : undefined,
      muted: options.muted ? toValue(options.muted) : undefined,
      playbackRate: options.playbackRate ? toValue(options.playbackRate) : undefined,
      poster: options.poster ? toValue(options.poster) : undefined,
      autoplay: options.autoplay ? toValue(options.autoplay) : undefined,
      loop: options.loop ? toValue(options.loop) : undefined,
    }),
    (newOptions, oldOptions) => {
      if (!playerRef.value) return;

      // 处理 URL 变更
      if (newOptions.url && playerRef.value.url !== newOptions.url && newOptions.url !== oldOptions?.url) {
        playerRef.value.switchUrl(newOptions.url);
        console.log('视频源已切换');
      }

      // 处理音量变更
      if (newOptions.volume !== undefined && newOptions.volume !== oldOptions?.volume) {
        playerRef.value.volume = newOptions.volume;
      }

      // 处理静音变更
      if (newOptions.muted !== undefined && newOptions.muted !== oldOptions?.muted) {
        playerRef.value.muted = newOptions.muted;
      }

      // 处理播放速度变更
      if (newOptions.playbackRate !== undefined && newOptions.playbackRate !== oldOptions?.playbackRate) {
        playerRef.value.playbackRate = newOptions.playbackRate;
      }

      // 处理海报变更
      if (newOptions.poster !== undefined && newOptions.poster !== oldOptions?.poster) {
        playerRef.value.poster = newOptions.poster;
      }

      // 处理自动播放和循环播放变更（需要重新创建播放器）
      if (newOptions.autoplay !== oldOptions?.autoplay || newOptions.loop !== oldOptions?.loop) {
        console.log('自动播放或循环播放配置已变更，需要重新创建播放器');
        destroyPlayer();
        setTimeout(createPlayer, 100);
      }
    },
    { deep: true }
  );

  // 事件监听（使用自定义事件类型）
  const on = <T extends keyof ArtplayerEvents>(event: T, callback: (...args: ArtplayerEvents[T]) => void): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerRef.value?.on(event as keyof Artplayer['Events'], callback as any);
  };

  return {
    // 播放器实例引用
    playerRef,
    containerRef,

    // 播放状态
    isPlaying,
    duration,
    currentTime,
    currentVolume,
    isMuted: isMutedState,

    // 播放控制
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate,
    mute,

    // 事件监听
    on,
  };
}
