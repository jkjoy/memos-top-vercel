// Memos Start
const memo = {
    host: 'https://demo.usememos.com/',
    limit: 10,
    creatorId: '1',
    domId: '#memos',
};

if (typeof memos !== "undefined") {
    Object.assign(memo, memos);
}

const limit = memo.limit;
const memosHost = memo.host.replace(/\/$/, '');
const memoUrl = `${memosHost}/api/v1/memos?filter=creator_id==${memo.creatorId}&pageSize=${limit}`;

let page = 1;
let nextPageToken = '';
let nextDom = '';
let btnRemove = 0;
const memoDom = document.querySelector(memo.domId);
const loadBtn = '<button class="load-btn button-load">努力加载中……</button>';

let userInfo; // 定义全局变量 userInfo

if (memoDom) {
    memoDom.insertAdjacentHTML('afterend', loadBtn);
    fetchUserInfo().then(info => {
        userInfo = info; // 赋值给全局变量 userInfo
        // 更新 banner 信息
        const bannerSubinfo = document.querySelector('.info');
        if (bannerSubinfo) {
            bannerSubinfo.textContent = userInfo.description;
        }
        getFirstList();
    });

    const btn = document.querySelector("button.button-load");
    btn.addEventListener("click", () => {
        btn.textContent = '努力加载中……';
        updateHTML(nextDom, userInfo); // 传递 userInfo 参数
        if (nextDom.length < limit) {
            btn.remove();
            btnRemove = 1;
            return;
        }
        getNextList();
    });
}

function getFirstList() {
    fetch(`${memoUrl}&pageToken=${nextPageToken}`)
        .then(res => res.json())
        .then(resdata => {
            updateHTML(resdata.memos, userInfo);
            nextPageToken = resdata.nextPageToken;
            if (resdata.memos.length < limit) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
            page++;
            getNextList();
        })
        .catch(error => console.error('Error fetching first list:', error));
}

function getNextList() {
    fetch(`${memoUrl}&pageToken=${nextPageToken}`)
        .then(res => res.json())
        .then(resdata => {
            nextPageToken = resdata.nextPageToken;
            nextDom = resdata.memos;
            page++;
            if (nextDom.length < 1) {
                document.querySelector("button.button-load").remove();
                btnRemove = 1;
                return;
            }
        })
        .catch(error => console.error('Error fetching next list:', error));
}

function fetchUserInfo() {
    return fetch(`${memosHost}/api/v1/users/${memo.creatorId}`)
        .then(response => response.json())
        .then(userData => {
            return {
                avatarurl: `${memosHost}${userData.avatarUrl}`,
                memoname: userData.displayName,
                userurl: `${memosHost}/u/${userData.username}`,
                description: userData.description,
                memousername: userData.username
            };
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            return {};
        });
}

function getLocationHtml(location) {
    if (location && location.placeholder) {
        const placeholder = location.placeholder;
        const locationSvg = `  • 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"></path>
            </svg>`;
        return `${locationSvg} ${placeholder}`;
    }
    return '';
}

function updateHTML(data, userInfo) {
    const TAG_REG = /#([^\s#]+?) /g;
    const BILIBILI_REG = /<a\shref="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?">.*<\/a>/g;
    const NETEASE_MUSIC_REG = /<a\shref="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g;
    const QQMUSIC_REG = /<a\shref="https\:\/\/y\.qq\.com\/.*(\/[0-9a-zA-Z]+)(\.html)?".*?>.*?<\/a>/g;
    const QQVIDEO_REG = /<a\shref="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g;
    const SPOTIFY_REG = /<a\shref="https:\/\/open\.spotify\.com\/(track|album)\/([\s\S]+)".*?>.*<\/a>/g;
    const YOUKU_REG = /<a\shref="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g;
    const YOUTUBE_REG = /<a\shref="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;

    let memoResult = '';
    for (const item of data) {
        let memoContREG = item.content
            .replace(TAG_REG, "<span class='tag-span'><a rel='noopener noreferrer' href='#$1'>#$1</a></span>");
        
        const locationHtml = getLocationHtml(item.location);
        
        memoContREG = marked.parse(memoContREG)
            .replace(BILIBILI_REG, "<div class='video-wrapper'><iframe src='//www.bilibili.com/blackboard/html5mobileplayer.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true' style='position:absolute;height:100%;width:100%;'></iframe></div>")
            .replace(YOUTUBE_REG, "<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen title='YouTube Video'></iframe></div>")
            .replace(NETEASE_MUSIC_REG, "<meting-js auto='https://music.163.com/#/song?id=$1'></meting-js>")
            .replace(QQMUSIC_REG, "<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>")
            .replace(QQVIDEO_REG, "<div class='video-wrapper'><iframe src='//v.qq.com/iframe/player.html?vid=$1' allowFullScreen='true' frameborder='no'></iframe></div>")
            .replace(SPOTIFY_REG, "<div class='spotify-wrapper'><iframe style='border-radius:12px' src='https://open.spotify.com/embed/$1/$2?utm_source=generator&theme=0' width='100%' frameBorder='0' allowfullscreen='' allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture' loading='lazy'></iframe></div>")
            .replace(YOUKU_REG, "<div class='video-wrapper'><iframe src='https://player.youku.com/embed/$1' frameborder=0 'allowfullscreen'></iframe></div>");

        if (item.resources && item.resources.length > 0) {
            const resourceList = item.resources;
            let imgUrl = '<div class="resource-wrapper"><div class="images-wrapper">';
            let resUrl = '';

            for (const res of resourceList) {
                const resType = res.type.slice(0, 5);
                const resexlink = res.externalLink;
                const resLink = resexlink ? resexlink : `${memosHost}/file/${res.name}/${res.filename}`;

                if (resType === 'image') {
                    imgUrl += `<div class="resimg">
                        <img loading="lazy" src="${resLink}"/>
                    </div>`;
                } else {
                    resUrl += `<a target="_blank" rel="noreferrer" href="${resLink}">${res.filename}</a>`;
                }
            }

            imgUrl += '</div></div>';

            if (imgUrl) {
                memoContREG += imgUrl;
            }
            if (resUrl) {
                memoContREG += `<div class="resource-wrapper"><p class="datasource">${resUrl}</p></div>`;
            }
        }

        const relativeTime = getRelativeTime(new Date(item.createTime));

        memoResult += `<li class="timeline"><div class="memos__content" style="--avatar-url: url(${userInfo.avatarurl})"><div class="memos__text"><div class="memos__userinfo"><a href=${userInfo.userurl} target="_blank" ><div>${userInfo.memoname}</div></a><div><svg viewBox="0 0 24 24" aria-label="认证账号" class="memos__verify"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg></div><div class="memos__id">@${userInfo.memousername}</div></div><p>${memoContREG}</p></div><div class="memos__meta"><small class="memos__date">${relativeTime} • From「<a href="${memosHost}/${item.name}" target="_blank">Memos</a>」${locationHtml}</small></div></div></li>`;
    }

    const resultAll = `<ul>${memoResult}</ul>`;
    memoDom.insertAdjacentHTML('beforeend', resultAll);
    document.querySelector('button.button-load').textContent = '加载更多';

    //DB
    fetchDB();

    // Images lightbox
    window.ViewImage && ViewImage.init('.container img');
    
}
// Memos End

// Relative Time Start
function getRelativeTime(date) {
    const rtf = new Intl.RelativeTimeFormat(memo.language, { numeric: "auto", style: 'short' });
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return rtf.format(-years, 'year');
    } else if (months > 0) {
        return rtf.format(-months, 'month');
    } else if (days > 0) {
        return rtf.format(-days, 'day');
    } else if (hours > 0) {
        return rtf.format(-hours, 'hour');
    } else if (minutes > 0) {
        return rtf.format(-minutes, 'minute');
    } else {
        return rtf.format(-seconds, 'second');
    }
}
// Relative Time End

// Toggle Darkmode
const localTheme = window.localStorage && window.localStorage.getItem("theme");
const themeToggle = document.querySelector(".theme-toggle");

if (localTheme) {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(localTheme);
}

themeToggle.addEventListener("click", () => {
    const themeUndefined = !new RegExp("(dark|light)-theme").test(document.body.className);
    const isOSDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (themeUndefined) {
        if (isOSDark) {
            document.body.classList.add("light-theme");
        } else {
            document.body.classList.add("dark-theme");
        }
    } else {
        document.body.classList.toggle("light-theme");
        document.body.classList.toggle("dark-theme");
    }

    window.localStorage &&
        window.localStorage.setItem(
            "theme",
            document.body.classList.contains("dark-theme") ? "dark-theme" : "light-theme",
        );
});
// Darkmode End

// Memos Total Start
function getTotal() { 
    fetch(`${memosHost}/api/v1/users/${memo.creatorId}:getStats`)
        .then(res => res.json())
        .then(resdata => {
            if (resdata && typeof resdata.totalMemoCount === 'number') {
                var memosCount = document.getElementById('total');
                if (memosCount) {
                    memosCount.innerHTML = resdata.totalMemoCount;
                }
            }
        })
        .catch(err => {
            console.error('Error fetching memos:', err);
        });
}

window.onload = getTotal;
// Memos Total End

// 解析豆瓣 Start
function fetchDB() {
    var dbAPI = 'https://api.loliko.cn/';
    var dbA = document.querySelectorAll(".timeline a[href*='douban.com/subject/']:not([rel='noreferrer'])") || '';
    if (dbA) {
                const promises = [];
        for (var i = 0; i < dbA.length; i++) {
            _this = dbA[i];
            var dbHref = _this.href;
            var db_reg = /^https\:\/\/(movie|book)\.douban\.com\/subject\/([0-9]+)\/?/;
            var db_type = dbHref.replace(db_reg, "$1");
            var db_id = dbHref.replace(db_reg, "$2").toString();
            if (db_type == 'movie') {
                var this_item = 'movie' + db_id;
                var url = dbAPI + "movies/" + db_id;
                if (localStorage.getItem(this_item) == null) {
                    promises.push(fetch(url).then(res => res.json()).then(data => {
                        let fetch_item = 'movies' + data.sid;
                        let fetch_href = "https://movie.douban.com/subject/" + data.sid + "/";
                        localStorage.setItem(fetch_item, JSON.stringify(data));
                        movieShow(fetch_href, fetch_item);
                    }).catch(error => {
                        console.error('Error fetching movie data:', error);
                    }));
                } else {
                    movieShow(dbHref, this_item);
                }
            } else if (db_type == 'book') {
                var this_item = 'book' + db_id;
                var url = dbAPI + "v2/book/id/" + db_id;
                if (localStorage.getItem(this_item) == null) {
                    promises.push(fetch(url).then(res => res.json()).then(data => {
                        let fetch_item = 'book' + data.id;
                        let fetch_href = "https://book.douban.com/subject/" + data.id + "/";
                        localStorage.setItem(fetch_item, JSON.stringify(data));
                        bookShow(fetch_href, fetch_item);
                    }).catch(error => {
                        console.error('Error fetching book data:', error);
                    }));
                } else {
                    bookShow(dbHref, this_item);
                }
            }
        }// for end
        Promise.all(promises).then(() => {
            console.log('All fetch operations completed');
        });
    }
}

function movieShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating);
    var db_html = "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" + fetch_href + "'>《" + data.name + "》</a></h4><div class='rating'><div class='rating-star allstar" + db_star + "'></div><div class='rating-average'>" + data.rating + "</div></div><time class='post-preview--date'>导演：" + data.director + " / 类型：" + data.genre + " / " + data.year + "</time><section class='post-preview--excerpt'>" + data.intro.replace(/\s*/g, "") + "</section></div></div><img referrer-policy='no-referrer' loading='lazy' class='post-preview--image' src=" + data.img + "></div>";
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    if (qs_dom) {
        qs_dom.parentNode.replaceChild(db_div, qs_dom);
        db_div.innerHTML = db_html;
    }
}

function bookShow(fetch_href, fetch_item) {
    var storage = localStorage.getItem(fetch_item);
    var data = JSON.parse(storage);
    var db_star = Math.ceil(data.rating.average);
    var db_html = "<div class='post-preview'><div class='post-preview--meta'><div class='post-preview--middle'><h4 class='post-preview--title'><a target='_blank' rel='noreferrer' href='" + fetch_href + "'>《" + data.title + "》</a></h4><div class='rating'><div class='rating-star allstar" + db_star + "'></div><div class='rating-average'>" + data.rating.average + "</div></div><time class='post-preview--date'>作者：" + data.author + " </time><section class='post-preview--excerpt'>" + data.summary.replace(/\s*/g, "") + "</section></div></div><img referrer-policy='no-referrer' loading='lazy' class='post-preview--image' src=" + data.images.medium + "></div>";
    var db_div = document.createElement("div");
    var qs_href = ".timeline a[href='" + fetch_href + "']";
    var qs_dom = document.querySelector(qs_href);
    if (qs_dom) {
        qs_dom.parentNode.replaceChild(db_div, qs_dom);
        db_div.innerHTML = db_html;
    }
}
// 解析豆瓣 End
