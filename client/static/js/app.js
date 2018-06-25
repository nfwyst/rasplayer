(function (Vue) {
        var api = 'http://127.0.0.1:8000/api/list'

        // 工具函数
        const pad = function(num , n) {
            return (Array(n).join(0) + num).slice(-n)
        }
        const convertDuration = function(duration) {
            const h = Math.floor(duration / 3600)
            const m = Math.floor(duration % 3600 / 60)
            const s = Math.floor(duration % 60)
            return h ? `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}` : `${pad(m, 2)}:${pad(s, 2)}`
        }

        //  存储池
        var list = []
        var zhihu = []
        var timer = 1

        if (localStorage.getItem('logined') === null) {
            localStorage.setItem('logined', false)
        }


        /**
         * 应用模块
         * @type {Vue}
         */
        var App = Vue.extend({
            data: function () {
                var logbtn = document.getElementById('out-btn')
                var infoEl = document.createElement('span')
                var __this = this
                // 样式
                infoEl.style.position = 'absolute'
                infoEl.style.right = '-25px'
                infoEl.style.top = '-10px'
                infoEl.style.display = 'block'
                infoEl.style.color = '#4eaa4c'
                infoEl.style.fontSize = '14px'
                infoEl.innerHTML = '注销'

                var target = document.getElementById('out-btn')
                var infoNum = 0
                if (localStorage.getItem('logined') == 'false') {
                    logbtn.className = 'hidden'
                }
                window.onbeforeunload = function (event) {
                    event.stopPropagation()
                    event.preventDefault()
                    __this.$http.get('/puase?id=' + 1 + '&st=11').then(function (res) {
                        if (res.data.success) {
                            return
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                    return undefined
                }
                return {
                    logged: localStorage.getItem('logined') === 'true' ? true : false,
                    infoEl: infoEl,
                    infoNum: infoNum,
                    target: target
                }
            },
            methods: {
                logout ( event ) {
                    localStorage.setItem('logined', false)
                    this.logged = localStorage.getItem("logined") === 'true' ? true : false
                    location.reload()
                },
                inInfo () {
                    if (this.infoNum < 1) {
                        this.target.appendChild(this.infoEl)
                        this.infoNum++
                    }
                },
                outInfo () {
                    this.target.removeChild(this.infoEl)
                    this.infoNum--
                }
            }
        })
        App.audio = new Audio()
        App.audio.firstAc = true

        /**
         * 报错组件
         * @type {Vue}
         */
        var Dev = Vue.extend({
            template: '<div class="error-outer"><div class="error-inner">{{reason}}</div></div>',
            data: function () {
                return {
                    reason: '请插入 U盘'
                }
            }
        })

        /**
         * 登录组件
         * @type {Vue}
         */
        var Login = Vue.extend({
            template: '<form @submit="log($event)" class="form-login"><input type="text" name="username" placeholder="用户名" v-model="username" required/> <input name="pwd" type="password" placeholder="密码" v-model="password" required/><input type="submit" value="提交"/></form>',
            data: function () {
                return {
                    username: '',
                    password: '',
                    infoNum: 0
                }
            },
            http: {
                emulateJSON: true
            },
            methods: {
                log (event) {
                    event.preventDefault()
                    // 从服务器获取数据
                    this.$http.post('http://127.0.0.1:8000/login', {'username': this.username, 'password': this.password}).then(function (res) {
                        data = res.data
                        if (data.isvalid) {
                            localStorage.setItem('logined', true)
                            router.go('/songs')
                            location.reload()
                        } else {
                            if (this.infoNum < 1) {
                                var error = document.createElement('div')
                                error.innerHTML = '用户名或密码错误!'
                                error.className = 'form-info'
                                var target = document.getElementsByClassName('form-login')[0]
                                target.appendChild(error)
                                this.infoNum++
                                _this = this
                                setTimeout(function () {
                                    target.removeChild(error)
                                    _this.infoNum--
                                }, 2300)
                            }
                        }
                    })
                }
            }
        })

        /**
         * 首页组件
         * @type {Vue}
         */
        var Home = Vue.extend({
            // template: '<ul class="zhihu"><li class="zhihu-i" v-for="item in items"><div class="Media"><img class="Media-figure" :src="item.image" alt=""><div class="Media-body"><h3 class="Media-title"><a class="news-title" v-link="{ name:' + "'content'" + ', params: {id: item.id} }">{{item.title}}</a></h3></div></div></li></ul>',
            template: '<div id="pi-des">树莓派（RaspberryPi），是一款基于Linux的单板机电脑。<span style="background: #DEE4E9">它由英国的树莓派基金会所开发，目的是以低价硬件及自由软件促进学校的基本计算机科学教育.</span>' +
            '树莓派的生产是通过有生产许可的两家公司:Element14/PremierFarnell和RS/Components这两家公司都在网上出售树莓派。' +
            '<span style="background: #DEE4E9">树莓派配备一枚博通（Broadcom）出产的ARM架构700MHzBCM2835处理器，256MB內存（B型已升级到512MB内存），使用SD卡当作存储媒体，且拥有一个Ethernet、两个USB接口、以及HDMI（支持声音输出）和 RCA端子输出支持。</span>树莓派只有一张信用卡大小，体积大概是一个火柴盒大小，可以运行像《雷神之锤III竞技场》的游戏和进行1080p视频的播放。操作系统采用开源的Linux系统如Debian、ArchLinux，自带的Iceweasel、KOffice等软件，能够满足基本的网络浏览、文字处理以及电脑学习的需要。分A、B两种型号，售价分别是A型25美元、B型35美元。树莓派基金会从2012年2月29日开始接受B型的订货。' +
            '树莓派基金会提供了基于ARM架构的Debian、ArchLinux和Fedora等的发行版供大众下载，还计划提供支持Python作为主要编程语言，支持BBCBASIC(通过RISCOS映像或者Linux的"BrandyBasic"克隆)、C语言和Perl等编程语言。' +
            '树莓派基金会于2016年2月发布了<span style="background: #DEE4E9">树莓派3,较前一代树莓派2，树莓派3的处理器升级为了64位的博通BCM2837，并首次加入了Wi-Fi无线网络及蓝牙功能，而售价仍然是35美元。</span></div><div id="pi-footer">--维基百科</div>',
            data: function () {
                this.$http.get('http://127.0.0.1:8000/news/latest').then(function (res) {
                    data = res.data.top_stories
                    for (item in data) {
                        data[item].image = '/img/proxy?img=' + encodeURIComponent(data[item].image)
                    }
                    zhihu = this.items = data
                })
                return {
                    items: zhihu
                }
            }
        })

        /**
         * 详情组件
         */
        var Detail = Vue.extend({
            template: '<div class="news-wrap"><div class="content-title">{{title}}</div><img class="detail-title-img" :src="titleImage"/><div class="n-detail">{{item}}</div></div>',
            data: function () {
                return {
                    item: '',
                    titleImage: '',
                    title: ''
                }
            },
            route: {
                data: function (transition) {
                    var content_id = transition.to.params.id
                    this.$http.get('http://127.0.0.1:8000/news/' + content_id).then(function (res) {
                        // 还原上一次状态
                        var target = document.getElementsByClassName('n-detail')[0]
                        target.innerHTML = ''
                        // 标题图片
                        var data = res.data
                        this.titleImage = '/img/proxy?img=' + encodeURIComponent(data.image)
                        // 标题
                        this.title = data.title

                        // 将内容字符串转行成 DOM  对象
                        var frame = document.createElement('iframe')
                        frame.style.display = 'none'
                        document.body.appendChild(frame)
                        frame.contentDocument.open()
                        frame.contentDocument.write(data.body)
                        frame.contentDocument.close()
                        var result = frame.contentDocument.body.firstChild;
                        document.body.removeChild(frame)

                        // 对所有图片做反代
                        var images = result.getElementsByTagName('img')
                        images.each = function (fn) {
                            for (var i = 0; i < this.length; i++) {
                                fn(i, this[i])
                            }
                        }
                        images.each(function(i, img) {
                            img.src = '/img/proxy?img=' + encodeURIComponent(img.src)
                        })

                        // 删除元素
                        var more = result.getElementsByClassName('view-more')[0]
                        var questions = result.getElementsByClassName('question')
                        var answer = result.getElementsByClassName('answer')[0]
                        var content = result.getElementsByClassName('content')[0]
                        var headline = result.getElementsByClassName('headline')[0]
                        try {
                            for (var i = 0; i < questions.length; i++) {
                                if (questions[i].contains(more)) {
                                    questions[i].removeChild(more)
                                }
                            }
                        } catch (e) {
                            try {
                                content.removeChild(more)
                            } catch (e) {
                                answer.removeChild(more)
                            }
                        }

                        if (headline) {
                            result.removeChild(headline)
                        }

                        target.appendChild(result)
                    })
                }
            }
        })

        /**
         * 歌曲列表组件
         * @type{Vue}
         */
        var Songs = Vue.extend({
            template: '<div class="list"><ol><li v-for="item in list"><a v-link="{ name:' + "'item'" + ', params: {id: item.id} }" value="{{item.id}}" @click="requestPlay($event)"><span class="num" value="{{item.id}}" @click="requestPlay($event)">{{pad(item.id, 3)}}</span><div class="info" value={{item.id}} @click="requestPlay($event)"><h3 class="title" value="{{item.id}}" @click="requestPlay($event)">{{item.name}}</h3><span class="artist" value="{{item.id}}" @click="requestPlay($event)">{{item.artist}}</span></div><span class="duration" value="{{item.id}}" @click="requestPlay($event)">{{convert(item.duration)}}</span><div class="photo" value="{{item.id}}" @click="requestPlay($event)"><img :src="item.poster" value={{item.id}} @click="requestPlay($event)"></div></a></li></ol></div>',
            data: function () {
                var logst = localStorage.getItem('logined')
                if (logst === 'true') {
                    logst = true
                } else {
                    logst = false
                }
                if (list.length === 0 && logst === true) {
                    this.$http.get(api)
                    .then(function (res) {
                        var st = res.data
                        if (st && st.content === 0) {
                            router.go({name: 'deverr', params: {reason: '请插入 U盘'}})
                        } else {
                            list = this.list = res.data
                        }
                    })
                } else {
                    router.go({name: 'login'})
                    location.reload()
                }
                return {
                    list: list
                }
            },
            http: {
                emulateJSON: true
            },
            methods: {
                pad: pad,
                convert: convertDuration,
                requestPlay: function (event) {
                    event.stopPropagation()
                    id = event.target.getAttribute('value')
                    timer++
                    this.$http.get('/play?id=' + id + '&fresh=' + (id + timer)).then(function (res) {
                        if (!res.data.success) {
                            router.go({name: 'list'})
                            location.reload()
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                }
            }
        })

        /**
         * 播放器组件
         * @type {Vue}
         */
        var Player = Vue.extend({
            template: '<div class="player">' +
                          '<div class="disc">' +
                            '<div class="circular-landscape" :style="{transform: \'rotate(\'+(item.current/item.duration*360*2) + \'deg)\'}"><img :src="item.poster" alt="{{item.artist}}"></div>' +
                            '<span class="duration">{{convert(item.duration - item.current)}}</span>' +
                          '</div>' +
                          '<h2 class="title">{{item.name}}</h2>' +
                          '<h3 class="artist">{{item.artist}}</h3>' +
                          '<div class="lyric">' +
                            '<p :class="{\'hide\':lyrs.has_p, \'previous\':!lyrs.has_p}"">{{lyrs.pre}}</p>' +
                            '<p class="current">{{lyrs.current}}</p>' +
                            '<p :class="{\'hide\':lyrs.has_n, \'next\':!lyrs.has_n}">{{lyrs.next}}</p>' +
                          '</div>' +
                          '<input type="range" value="0" min="0" max="{{item.duration}}" v-model="item.current"  @change="progress()">' +
                          '<div class="controls">' +
                            '<button><i class="fa" :class="{\'fa-retweet\':!item.repeat,\'fa-repeat\':item.repeat}" @click="repeat()"></i></button>' +
                            '<button class="active" @click="prev()"><i class="fa fa-backward"></i></button>' +
                            '<button class="active" @click="play()"><i class="fa" :class="{\'fa-play\':!item.playing,\'fa-pause\': item.playing}"></i></button>' +
                            '<button class="active" @click="next()"><i class="fa fa-forward"></i></button>' +
                            '<button class="active" @click="mute()"><i class="fa" :class="{\'fa-volume-up\':!item.muted,\'fa-volume-off\':item.muted}"></i></button>' +
                            '<button class="active" @click="random()"><i class="fa fa-random"></i></button>' +
                          '</div>' +
                       '</div>',
            data: function () {
                return {
                    item: {},
                }
            },
            route: {
                data: function (transition) {
                    var id = parseInt(transition.to.params.id, 10)
                    if (!id) {
                        return router.go({name: 'home'})
                    }
                    if (list.length === 0) {
                        return router.go({name: 'list'})
                        // this.$http.get(api).then(function(res){
                        //     list = res.data
                        //     this.item = list[id]
                        // })
                    }
                    // 获取项目
                    var item = {current: 0, playing: false, random: false, repeat: false, muted: false}
                    Object.assign(item, list[id - 1])

                    if (App.audio.firstAc) {
                        App.audio.muteSt = true
                        App.audio.volume = 0
                        App.audio.firstAc = false
                    }

                    if (typeof App.audio.muteSt === 'boolean') {
                        item.muted = App.audio.muteSt
                    }
                    if (typeof App.audio.repeatSt === 'boolean') {
                        item.repeat = App.audio.repeatSt
                    }

                    // 歌词部分
                    var lyr_url = item.lyric
                    var lyr_list = []
                    var time_list = []
                    var lyrs = {pre: null, current: null, next: null}
                    // 歌词
                    var lyrs_map = {}
                    var pre_map = {}
                    var next_map = {}
                    this.$http.get(lyr_url).then(function(res) {
                        var data = res.data.split('\n')
                        for (var i = 0; i < data.length - 1; i++) {
                            var item = data[i].split(']')[1]
                            var time = data[i].split(/ |\]|\[/)[1]
                            time = time.split(/:/)
                            time =  parseFloat(time[0]) * 60  + parseFloat(time[1])
                            time_list.push(time)
                            lyr_list.push(item)
                        }
                        var beginner = 0
                        var pre = ""
                        var pre_lyric = ""
                        var next_pre_lyric = ""
                        for(var i = 0; i < time_list.length; i++) {
                            for(var j = beginner; j <= time_list[i]; j++) {
                                if (lyr_list[i - 1] == "") {
                                    lyrs_map[parseInt(j)] = pre;
                                } else {
                                    pre = lyrs_map[parseInt(j)] = lyr_list[i - 1]
                                }
                                if (lyr_list[i - 2] == undefined) {
                                    pre_map[parseInt(j)] = ""
                                } else if (lyr_list[i - 2] == "") {
                                    pre_map[parseInt(j)] = pre_lyric
                                } else {
                                    pre_lyric = pre_map[parseInt(j)] = lyr_list[i - 2]
                                }
                                if (lyr_list[i] == undefined) {
                                   next_map[parseInt(j)] = ""
                                } else if (lyr_list[i] == "") {
                                   next_map[parseInt(j)] = next_pre_lyric
                                }  else {
                                   next_pre_lyric = next_map[parseInt(j)] = lyr_list[i]
                                }
                                // 歌词微调
                                if (next_map[parseInt(j)] === lyrs_map[parseInt(j)]) {
                                    next_map[parseInt(j)] = lyr_list[i+1]
                                }
                                if (pre_map[parseInt(j)] === lyrs_map[parseInt(j)]) {
                                    pre_map[parseInt(j)] = lyr_list[i-3]
                                }
                            }
                            beginner = time_list[i] + 0.01
                        }
                    }, function (error) {
                        return
                    })

                    // 事件与控制
                    var __this = this
                    App.audio.src = item.music
                    App.audio.autoplay = true
                    App.audio.addEventListener('loadedmetadata', function () {
                        // TODO QUESTION
                        item.duration = App.audio.duration
                    })
                    App.audio.addEventListener('timeupdate', function () {
                        item.current = App.audio.currentTime
                        try {
                            if (lyr_list.length != 0) {
                                lyrs.has_p = true
                                lyrs.has_n = true
                                lyrs.current = lyrs_map[parseInt(App.audio.currentTime)]
                                lyrs.pre = pre_map[parseInt(App.audio.currentTime)]
                                lyrs.next = next_map[parseInt(App.audio.currentTime)]
                            } else {
                                lyrs.current = '该曲目没有歌词, 请欣赏'
                                lyrs.pre = ''
                                lyrs.next = ''
                            }
                        } catch (e) {
                            console.log('读取歌词信息失败')
                        }
                    })
                    App.audio.addEventListener('play', function () {
                        item.playing = true
                    })
                    App.audio.addEventListener('pause', function () {
                        item.playing = false
                    })
                    App.audio.addEventListener('ended', function (event) {
                        event.preventDefault()
                        event.stopPropagation()
                        if (item.repeat) {
                            timer++
                            __this.$http.get('/play?id=' + item.id + '&fresh=' + (item.id + timer)).then(function (res) {
                                if (!res.data.success) {
                                    router.go({name: 'list'})
                                    location.reload()
                                }
                                App.audio.play()
                            }, function (error) {
                                App.audio.pause()
                            })
                        } else {
                            var ids = list.map(function (e) {
                                return e.id
                            })
                            var targetIndex = ids.indexOf(item.id) + 1
                            if (targetIndex >= ids.length) {
                                targetIndex = 0
                            }
                            (function (targetIndex) {
                                __this.$http.get('/play?id=' + ids[targetIndex]).then(function (res) {
                                    if (res.data.success) {
                                        console.log('id 是' + ids[targetIndex])
                                        router.go({name: 'item', params: {id: ids[targetIndex]}})
                                    }
                                }, function (error) {
                                    App.audio.pause()
                                })
                            })(targetIndex);
                        }
                    })

                    return {
                        item: item,
                        lyr_list: lyr_list,
                        lyrs: lyrs,
                        time_list: time_list
                    }
                }
            },
            methods: {
                convert: convertDuration,
                play () {
                    if (this.item.playing) {
                        var st = 1 // 需要暂停
                    } else if (!this.item.playing) {
                        var st = 0 //需要播放
                    }
                    this.$http.get('/puase?id=' + this.item.id + '&st=' + st).then(function (res) {
                        if (res.data.success) {
                            if (this.item.playing) {
                                App.audio.pause()
                            } else {
                                App.audio.play()
                            }
                            this.item.playing = !this.item.playing
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                },
                progress () {
                    App.audio.currentTime = this.item.current
                },
                next () {
                    var ids = list.map(function (e) {
                        return e.id
                    })
                    var targetIndex = ids.indexOf(this.item.id) + 1
                    if (targetIndex >= ids.length) {
                        targetIndex = 0
                    }
                    this.$http.get('/play?id=' + ids[targetIndex]).then(function (res) {
                        if (res.data.success) {
                            router.go({name: 'item', params: {id: ids[targetIndex]}})
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                },
                prev () {
                    var ids = list.map(function (e) {
                        return e.id
                    })
                    var targetIndex = ids.indexOf(this.item.id) - 1
                    if (targetIndex < 0) {
                        targetIndex = ids.length - 1
                    }
                    if (targetIndex >= ids.length) {
                        targetIndex = 0
                    }
                    this.$http.get('/play?id=' + ids[targetIndex]).then(function (res) {
                        if (res.data.success) {
                            router.go({name: 'item', params: {id: ids[targetIndex]}})
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                },
                repeat () {
                    App.audio.repeatSt = this.item.repeat = !this.item.repeat
                },
                mute () {
                    App.audio.muteSt = this.item.muted = !this.item.muted
                    if (this.item.muted == true) {
                        this.$http.get('/mute?id=' + this.item.id + '&mute=0').then(function (res) {
                            if (res.data.success) {
                                App.audio.volume = 0
                            }
                        })
                    } else {
                        this.$http.get('/mute?id=' + this.item.id + '&mute=1').then(function (res) {
                            if (res.data.success) {
                                App.audio.volume = 1
                            }
                        })
                    }
                },
                random () {
                    var ids = list.map(function (e) {
                        return e.id
                    })
                    var targetIndex = parseInt(Math.random() * (ids.length))
                    this.$http.get('/play?id=' + ids[targetIndex]).then(function (res) {
                        if (res.data.success) {
                            router.go({name: 'item', params: {id: ids[targetIndex]}})
                        }
                    }, function (error) {
                        console.log(error.message)
                    })
                }
            },
        })

        // 路由
        var router = new VueRouter()
        router.map({
            '/home': {
                name: 'home',
                component: Home
            },
            '/songs': {
                name: 'list',
                component: Songs
            },
            '/songs/:id': {
                name: 'item',
                component: Player
            },
            '/deverror': {
                name: 'deverr',
                component: Dev
            },
            '/login': {
                name: 'login',
                component: Login
            },
            '/detail/:id': {
                name: 'content',
                component: Detail
            }
        })
        router.redirect({'*': '/home'})

        router.start(App, '#app')
}(Vue))
