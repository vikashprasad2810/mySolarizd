import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, Validators } from '@angular/forms';
// import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
//Services
import { YoutubeApiService } from './shared/services/youtube-api.service';
import { YoutubePlayerService } from './shared/services/youtube-player.service';

// const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const time_extractor = /([0-9]*H)?([0-9]*M)?([0-9]*S)?$/;
@Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
      results: string[];
      isPause: boolean;
      isPlaylist: boolean;
      isIframe: boolean;
      isRelatedList: boolean;
      istimeDuration: boolean;
      playlist: string[];
      videoId: string;

      private player;
      private ytEvent;
      public progressBar;
      public timeDuration;
      public volume;
      private last_search: string;

      @Input() playPauseEvent


      constructor(private youtubeService: YoutubeApiService,
            private YoutubePlayer: YoutubePlayerService,
            private sanitizer: DomSanitizer) {
      }

      //onModelChnage getting data
      searchData(dataObject): void {
            if (dataObject.dataSearch.length > 0) {
                  this.last_search = dataObject.dataSearch;
                  this.youtubeService.searchVideos(this.last_search)
                        .then(data => {
                              if (data) {
                                    var dataArray = data;
                                    for (var i = 0; i < dataArray.length; i++) {
                                          if (dataArray[i].contentDetails.duration) {
                                                var duration = this.convertYouTubeDuration(dataArray[i].contentDetails.duration);
                                                dataArray[i].contentDetails.duration = duration;
                                          }
                                    }
                                    if (dataArray.length > 0)
                                          this.results = dataArray;
                              }
                        })
            }
      }


      ngOnInit(): void {
            this.isPause = true;
            this.isPlaylist = false;
            this.isIframe = false;
            this.isRelatedList = false;
            this.playlist = [];
            this.istimeDuration = false;
            this.youtubeService.searchVideos('')
                  .then(data => {
                        if (data) {
                              var dataArray = data;
                              if (dataArray.length > 0) {
                                    for (var i = 0; i < dataArray.length; i++) {
                                          if (dataArray[i].contentDetails.duration) {
                                                var duration = this.convertYouTubeDuration(dataArray[i].contentDetails.duration);
                                                dataArray[i].contentDetails.duration = duration;
                                          }
                                    }
                                    if (dataArray.length > 0)
                                          this.results = dataArray;
                              }

                        }
                  });
      }

      convertYouTubeDuration(duration: any) {
            var extracted = time_extractor.exec(duration);
            var hours = parseInt(extracted[1], 10) || 0;
            var minutes = parseInt(extracted[2], 10) || 0;
            var seconds = parseInt(extracted[3], 10) || 0;
            var sec = (seconds < 10)? '0'+ seconds: seconds;
            var min = (minutes < 10)? '0'+minutes:minutes;
            var durationInterval = (hours > 0)? (hours + ':' + min + ':' + sec):(min + ':' + sec);
            return durationInterval.toString();
      }

      selectVideo(video: any) {
            console.log(video)
            this.playlist.push(video);
            if (this.playlist.length > 0) {
                  this.YoutubePlayer.playVideo(video.id, video.snippet.title);
                  this.isPlaylist = true;
                  this.isIframe = true;
                  this.playerInfo();
            }
      }

      playPause(event: string): void {
            console.log(this.playPauseEvent);
            event === 'pause' ? this.isPause = false : this.isPause = true;
            event === 'pause' ? this.YoutubePlayer.pausePlayingVideo() : this.YoutubePlayer.playPausedVideo();
      }

      playerInfo() {
            var self = this;
            setInterval(function () {
                  var progressBar = self.YoutubePlayer.updateProgressBar()
                  var timeDuration = self.YoutubePlayer.updateTimerDisplay();
                  if (progressBar) {
                        self.progressBar = progressBar;
                        self.timeDuration = timeDuration
                        self.istimeDuration = true;
                  }
                  self.volume = self.YoutubePlayer.volume;
            }, 1000);
      }


}

interface ItemsResponse {
      results: string[];
}
