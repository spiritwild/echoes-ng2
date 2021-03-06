import { Http, URLSearchParams, Response } from '@angular/http';
import { Injectable, NgZone } from '@angular/core';
import { window } from '@angular/platform-browser/src/facade/browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { EchoesState } from '../store';
import { PlayerActions, YoutubePlayerState } from '../store/youtube-player';

@Injectable()
export class YoutubePlayerService {
  public player: YT.Player;
  public player$: Observable<YoutubePlayerState>;
  private isFullscreen: boolean = false;
  private defaultSizes = {
      height: 270,
      width: 367
  };

  constructor (
    private store: Store<EchoesState>,
    private zone: NgZone,
    private playerActions: PlayerActions
    ) {
    this.player$ = this.store.select(_store => _store.player);
    this.player$.subscribe(player => { this.isFullscreen = player.isFullscreen; });
  }

  setupPlayer (player) {
    this.player = player;
  }

  play () {
    this.player.playVideo();
  }

  pause () {
    this.player.pauseVideo();
  }

  playVideo(media: any) {
    const id = media.id.videoId ? media.id.videoId : media.id;
    this.player.loadVideoById(id);
    this.play();
    // this.store.dispatch({ type: PLAY, payload: media });
  }

  togglePlayer() {
    this.store.dispatch(this.playerActions.togglePlayer(true));
  }

  isPlaying () {
    // because YT is not loaded yet 1 is used - YT.PlayerState.PLAYING
    const isPlayerReady: any = this.player && this.player.getPlayerState;
    const playerState = isPlayerReady ? this.player.getPlayerState() : {};
    const isPlayerPlaying = isPlayerReady
      ? playerState !== YT.PlayerState.ENDED && playerState !== YT.PlayerState.PAUSED
      : false;
    return isPlayerPlaying;
  }

  onPlayerStateChange (event) {
    const state = event.data;
    let autoNext = false;
    // play the next song if its not the end of the playlist
    // should add a "repeat" feature
    if (state === YT.PlayerState.ENDED) {
      // this.listeners.ended.forEach(callback => callback(state));
    }

    if (state === YT.PlayerState.PAUSED) {
      // service.playerState = YT.PlayerState.PAUSED;
    }
    if (state === YT.PlayerState.PLAYING) {
      // service.playerState = YT.PlayerState.PLAYING;
    }
    this.store.dispatch(this.playerActions.updateState(state));
  }

  setSize () {
    let { height, width } = this.defaultSizes;

    if (!this.isFullscreen) {
      height = window.innerHeight;
      width = window.innerWidth;
    }
    this.player.setSize(width, height);
    this.store.dispatch(this.playerActions.fullScreen());
  }
}
