class LyricSequence {
	constructor() {
        this.lyric = [];
        this.sequence = [];
	}

	insert(timeList, lyricLine) {
		if (!lyricLine || !lyricLine.length) {
			lyricLine = ' ';
		}
		let index = this.lyric.indexOf(lyricLine);
		if (index === -1) {
			index = this.lyric.push(lyricLine) - 1;
		}
		timeList.forEach((time) => {
			this.sequence.push({time: time, index: index});
		});
	}

	static compare(s1, s2) {
	    if (s1.time > s2.time)
	        return 1;
	    else if (s1.time < s2.time)
	        return -1;
	    else
	        return 0;
    }

    sort() {
	    this.sequence.sort(LyricSequence.compare);
    }

    find(currentTime) {
	    let index = -1;
	    for (let i = 0; i < this.sequence.length; i++)
	        if (currentTime >= this.sequence[i].time)
	            index = i;
	        else
                break;
	    return index;
    }
}

class MusicHandler {
	static staticConstructor() {
        this.lyricTemplate = template`
		    <div class="${1}">${0}</div>
		`;
	}

	constructor({
		lyricContainerId,
	}) {
		this.lyricContainer = document.getElementById(lyricContainerId);
	}

	init({
        lyricText,
        musicUri,
		cdRoundBtn,
		title,
    }) {
		this.cdRoundBtn = document.getElementById(cdRoundBtn);
        this.lyricText = lyricText;
        this.lyricSequence = new LyricSequence();
        this.musicUri = musicUri;
        this.activeIndex = -1;
        this.title = document.getElementsByTagName('title')[0];
        this.title.text = title;

        this.splitLyric();
        this.initLyricContainer();
        this.createInterval();
        this.createScrollListener();
        this.initEvents();
    }

    initEvents() {
		let this_ = this;
        // this.audio.addEventListener('onplay', function () {
			// this_.isPlaying = true;
			// activate(this_.cdRoundBtn);
        // });
		this.cdRoundBtn.addEventListener('click', function () {
			activate(this_.cdRoundBtn);
			this_.audio.play();
        })
	}

	static timeLyricResultToNumber(timeLyricResult) {
		return parseInt(timeLyricResult[1]) * 60 + parseFloat(timeLyricResult[2] + '.' + timeLyricResult[3]);
		// let milliseconds = parseInt(timeLyricResult[3]);
		// for (let i = 0; i < timeLyricResult[3].length; i++) {
		// 	milliseconds /= 10;
		// }
		// return seconds + milliseconds;
	}

	splitTimeLyric(rawLyricLine) {
		let timeRegex = /\[(\d+):(\d+).(\d+)]/g;
		let timeList = [];
		let lyricLine = rawLyricLine;
		let timeLyricResult;
		do {
		    timeRegex.lastIndex = 0; // 每次检索前要把lastIndex置零 http://www.w3school.com.cn/jsref/jsref_exec_regexp.asp
			timeLyricResult = timeRegex.exec(lyricLine);
			if (timeLyricResult === null)
				break;
			timeList.push(MusicHandler.timeLyricResultToNumber(timeLyricResult));
            lyricLine = lyricLine.substr(timeLyricResult[0].length);
        } while (1);
        if (timeList.length)
            this.lyricSequence.insert(timeList, lyricLine);
	}

	splitLyric() {
		let lyricLines = this.lyricText.split('\n');
		lyricLines.forEach((lyricLine) => {
		    this.splitTimeLyric(lyricLine)
        });
		this.lyricSequence.sort();
		// console.log(this.lyricSequence);
	}

	initLyricContainer() {
        this.lyricContainer.innerHTML = `<div class="scroll-lyric-container"></div><audio loop></audio>`;
        this.scrollLyricContainer = this.lyricContainer.getElementsByClassName('scroll-lyric-container')[0];
        this.audio = this.lyricContainer.getElementsByTagName('audio')[0];
        this.audio.src = this.musicUri;

        this.lyricSequence.sequence.forEach((item) => {
	        let html = stringToHtml(
	            MusicHandler.lyricTemplate(
	                this.lyricSequence.lyric[item.index],
                    inactive,
                ));
	        this.scrollLyricContainer.appendChild(html);
        });

        this.divList = this.scrollLyricContainer.getElementsByTagName('div');
    }

    createInterval() {
	    let containerHeight = this.lyricContainer.offsetHeight;

	    setInterval( () => {
	        let currentTime = this.audio.currentTime;
            let index = this.lyricSequence.find(currentTime);
            if (this.activeIndex === index)
                return;
            if (this.activeIndex > -1)
                deactivate(this.divList[this.activeIndex]);
            if (index > -1)
                activate(this.divList[index]);
            this.activeIndex = index;

            let marginTop = containerHeight / 2 -
                this.divList[this.activeIndex].offsetTop +
                this.scrollLyricContainer.offsetTop -
                this.divList[this.activeIndex].offsetHeight / 2;
            this.scrollLyricContainer.style.marginTop = marginTop + 'px';
        }, 100);
    }

    createScrollListener() {
	    this.scrollLyricContainer.onscroll = function ($event) {
            console.log($event);
        }
    }
}

MusicHandler.staticConstructor();
