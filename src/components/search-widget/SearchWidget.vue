<template>
    <div>
        <section v-if="loaded" class="search-widget bg-blue-300 rounded p-2 p-sm-3 p-xl-4 c-primary-100 mb-4">
            <div class="widget-wrapper custom-container">
                <div class="widget-content my-2">
                    <h1 class="fs-h2 fs-lg-h3 text-center text-lg-start fw-bolder mb-5 mb-lg-4">Заголовок виджета</h1>
                    <div class="widget-form  d-flex flex-wrap align-items-end justify-content-between">
                        <div class="widget-form-input mb-1 mb-lg-4 col-12 col-lg-auto c0 fs-s fs-xxl-s">
                            <div class="w-form-label fw-bolder mb-1 c-blue-100 c-lg-primary-100 fs-ss fs-sm-s fs-xxl-s">Город отправления</div>
                            <MultiCheckDD
                                :value="form.town.value"
                                :options="form.town.options"
                                @change="form.town.value = $event"
                            />
                        </div>

                        <div class="widget-form-input mb-1 mb-lg-4 col-12 col-lg-6  fs-s fs-xxl-s">
                            <div class="w-form-label fw-bolder mb-1 c-blue-100 c-lg-primary-100 fs-ss fs-sm-s fs-xxl-s">
                                Период отправления
                            </div>
                            <div class="w-form-inputs d-flex">
                                <div class="w-form-input d-flex align-items-center justify-content-between bg-primary-100 px-3 py-2 me-1 me-lg-2 rounded w-100">
                                    <span class="w-form-input-prefix c-gray-300 pe-1 pe-sm-3 ">с</span>
                                    <DatePicker :date="form.date_1" @change="form.date_1 = $event" :allowed-dates="available_dates"/>
                                </div>
                                <div class="w-form-input d-flex align-items-center justify-content-between bg-primary-100 px-3 py-2 rounded w-100">
                                    <span class="w-form-input-prefix c-gray-300 pe-1 pe-sm-3">по</span>
                                    <DatePicker :date="form.date_2" @change="form.date_2 = $event" :allowed-dates="available_dates"/>
                                </div>
                            </div>
                        </div>

                        <div class="widget-form-input mb-1 mb-lg-4 col-6 col-lg-auto fs-s fs-xxl-s ">
                            <div class="w-form-label fw-bolder mb-1  c-blue-100 c-lg-primary-100 fs-ss fs-sm-s fs-xxl-s">
                                Продолжительность
                            </div>
                            <MultiCheckDD
                                :value="form.days.value"
                                :options="form.days.options"
                                @change="form.days.value = $event"
                            />
                        </div>
                        <div class="widget-form-input mb-1 mb-lg-4 col-6 col-lg-auto fs-s fs-xxl-s">
                            <div class="w-form-label fw-bolder mb-1 c-blue-100 c-lg-primary-100 fs-ss fs-sm-s fs-xxl-s">
                                Город на пути
                            </div>
                            <MultiCheckDD
                                :value="form.dest.value"
                                :options="form.dest.options"
                                @change="form.dest.value = $event"
                            />
                        </div>
                        <div class="widget-form-input mb-4 col-12 col-lg-6 fs-s fs-xxl-s">
                            <div class="w-form-label fw-bolder mb-1 fs-s fs-xxl-s c-blue-100 c-lg-primary-100 fs-ss fs-sm-s fs-xxl-s">
                                Теплоход</div>
                            <MultiCheckDD
                                :fixed="!!fixed_ship"
                                :value="form.ship.value"
                                :options="form.ship.options"
                                @change="form.ship.value = $event"
                            />
                        </div>
                        <div class="widget-form-button mb-4 col-12 col-lg-auto d-flex justify-content-end">
                            <button
                                @click="search()"
                                class="btn d-flex align-items-center justify-content-center bg-red-300 w-100 c-primary-100 py-3 px-4 fw-bolder text-uppercase">
                                Найти круиз
                            </button>
                        </div>
                    </div>
                    <div class="widget-count__result d-flex justify-content-center align-items-center">
                        <div class="mt-0 mt-lg-2 fw-bolder fs-s">Круизов найдено: {{ find_count }}</div>
                    </div>
                </div>
            </div>
        </section>
        <section>
            <template v-if="result">
                <template>
                    <Pagination @go="goPage" :page="page" :pages_count="pages_count"></Pagination>
                </template>
                <div id="Result" class="d-flex flex-column" :class="{preloader:process}"  v-html="result"></div>
                <template>
                    <Pagination @go="goPage" :page="page" :pages_count="pages_count"></Pagination>
                </template>
            </template>
        </section>
    </div>

</template>

<script>
import axios from "axios";
import MultiCheckDD from "../vue-components/MultiCheckDD";
import DatePicker from "./components/DatePicker";
import Pagination from "./components/Pagination";
export default {
    name: "SearchWidget",
    components: { DatePicker, MultiCheckDD, Pagination },
    data() {
        return {
            process: false,
            loaded: false,
            DB: null,
            alert: null,
            find_count: 0,
            s_table: [], // Таблица быстрого поиска по городу
            fixed_ship: null, // Фиксированный теплоход
            ids: [], // Набор id для запроса
            form: {
                town: null,
                dest: null,
                date_1: null,
                date_1_changed: false,
                date_2: null,
                date_2_changed: false,
                date_range: null,
                days: null,
                ship: null,
            },
            available_dates:[], // Доступные для поиска даты
            years: [],
            pages_count: 0,
            page: 0,
            per_page: 11,
            result: null,
            //checkin_id: null
        }
    },
    mounted() {
        this.fixed_ship = parseInt($('meta[name="fixed-ship"]').attr('content'));
        ////// this.startCheckin()
        let local_db = this.getLocalDb()
        if (local_db) {
           this.bootstrap(local_db)
        } else {
            this.sync({
                method: 'mounted',
                then: (remote_db) => {
                    this.bootstrap(remote_db)
                    this.setLocalDb(remote_db)
                }
            })
        }
    },
    methods: {
        sync(opts)
        {
            this.process = true
            let domain = location.origin
            let data = (opts.data) ? opts.data : null
            let api_url = domain + '/rivercrs/api/' + opts.method
            console.log(api_url, data) // todo:debug
            // Если нет данных то запрос GET
            if (!data) {
                axios.get(api_url)
                    .then((response) => {
                        this.process = false
                        opts.then(response.data)
                        console.log(response) // todo:debug
                    })
                    .catch((error) => {
                        this.process = false
                        console.log(error) // todo:debug
                    })
            }
            // Если есть data то запрос POST
            else {
                axios.post(api_url, data)
                    .then((response) => {
                        this.process = false
                        opts.then(response.data)
                        console.log(response) // todo:debug
                    })
                    .catch((error) => {
                        this.process = false
                        console.log(error) // todo:debug
                    })
            }
        },
        mutateDate(date) {
            return date
        },
        getLocalDb()
        {
            let local_db_time = localStorage.getItem('rivercrs_db_time')
            if (!local_db_time) {
                return
            }
            let time_to_live_sec = 3600
            let time_now_sec = Math.floor(new Date().getTime() / 1000)
            if (time_now_sec - local_db_time < time_to_live_sec) {
                let let_local_db = localStorage.getItem('rivercrs_db')
                let_local_db = JSON.parse(let_local_db)
                return let_local_db
            }
            return false
        },
        setLocalDb(data)
        {
            console.log('Сохраняю базу')
            let time_now_sec = Math.floor(new Date().getTime() / 1000)
            localStorage.setItem('rivercrs_db_time', time_now_sec.toString())
            data = JSON.stringify(data)
            localStorage.setItem('rivercrs_db', data)
        },
        bootstrap(db)
        {
            this.DB = db
            this.formFill(() => {
                this.loaded = true
                this.selectActualDate()
                this.getFilterOptions(() => {
                    this.search()
                })
                if (this.fixed_ship) {
                    this.form.ship.value = [parseInt(this.fixed_ship)]
                    this.search()
                }
            })
        },
        formFill(callback)
        {
            /* Dropdown options in objects (for collectiong) */
            let town_obj={},
                dest_obj={},
                days_obj={},
                ship_obj={}

            // Collect town and desc
            for (let i in this.DB.ways) {
                let town_id = this.DB.ways[i].town_id
                if (!this.DB.soft[town_id]) {
                    if (this.DB.ways[i].start) {
                        // Add to town options
                        if (this.DB.towns[town_id]) {
                            town_obj[town_id] = this.DB.towns[town_id]
                        }
                    } else {
                        // Add to dest options
                        if (this.DB.towns[town_id]) {
                            dest_obj[town_id] = this.DB.towns[town_id]
                        }
                    }
                }
                this.toTable(this.DB.ways[i])
            }

            // Collect days
            for (let i in this.DB.checkins) {
                days_obj[this.DB.checkins[i].days] = this.DB.checkins[i].days+''
                this.available_dates.push(this.secToDate(this.DB.checkins[i].date))
            }

            // Оставить уникальные даты
            this.available_dates = this.uniqueArr(this.available_dates)

            // Collect ships
            for (let i in this.DB.ships) {
                ship_obj[i] = this.DB.ships[i]
            }

            // Add to model town
            this.form.town = {
                value: [],
                options: this.objToArray(town_obj, 1)
            }

            // Add to model dest
            this.form.dest = {
                value: [],
                options: this.objToArray(dest_obj, 1)
            }

            // Add to model days
            this.form.days = {
                value: [],
                options: this.objToArray(days_obj)
            }

            // Add to model ship
            this.form.ship = {
                value: [],
                options: this.objToArray(ship_obj, 1)
            }

            callback()
        },
        // @output: (int) seconds ex: 1567022400
        nowInSeconds()
        {
            return parseInt(new Date().getTime() / 1000)
        },
        secToDate(input_date)
        {
            input_date *= 1000
            let date = new Date(input_date)
            let dd = date.getDate()
            if (dd < 10) {
                dd = '0' + dd
            }
            let mm = date.getMonth() + 1
            if (mm < 10) {
                mm = '0' + mm
            }
            return dd + '.' + mm + '.' + date.getFullYear()
        },
        // @input: (string) formated date ex: 27.11.2017
        // @output: (int) seconds ex: 1567022400
        dateToSec(date)
        {
            date = date.split('.')
            let y = parseInt(date[2])
            let m = parseInt(date[1]) - 1
            let d = parseInt(date[0])
            return new Date(y, m, d) / 1000
        },
        // Выбрать актуальные даты в календарях
        selectActualDate() {
            let now = this.nowInSeconds()
            let date_1 = null
            let date_2 = null

            // Если есть следующий год
            let nextYear = (this.years.length > 1) ? this.years[1].value : 0
            let nextYearActive = nextYear && this.years[1].active

            if (nextYear) {
                nextYear = new Date(nextYear, 0, 1, 0, 0, 0, 0)
                nextYear = parseInt(nextYear.getTime() / 1000)
            }

            for (let i in this.DB.checkins) {
                if (nextYearActive) {
                    if (date_1 == null && this.DB.checkins[i].date > nextYear) {
                        date_1 = this.secToDate(this.DB.checkins[i].date)
                    }
                } else {
                    if (date_1 == null && this.DB.checkins[i].date > now) {
                        date_1 = this.secToDate(this.DB.checkins[i].date)
                    }
                }

                if (nextYearActive) {
                    date_2 = this.secToDate(this.DB.checkins[i].date)
                } else {
                    if (nextYear) {
                        if (date_2 == null && this.DB.checkins[i].date > nextYear) {
                            date_2 = this.secToDate(this.DB.checkins[i].date)
                        }
                    }
                }

                if (!nextYearActive && date_1 && date_2) {
                    break
                }
            }

            this.form.date_1 = date_1
            this.form.date_2 = date_2
        },
        // Нажатие на кнопку поиск
        search()
        {
            if (this.process) {
                return
            }
            this.searchFilter((ids) => {
                this.idsBuild(ids, () => {
                    this.showAlert()
                    if (!this.ids.length) {
                        this.result = this.empty_answer
                        return;
                    }
                    this.query()
                })
            })
        },
        showAlert()
        {
            this.alert = null
            setTimeout(() => {
                this.alert = 'Круизов найдено: ' + this.find_count
            }, 100)
        },
        // Добавить запись в таблицу поиска
        toTable(way)
        {
            if (!this.s_table[way.checkin_id]) {
                this.s_table[way.checkin_id] = {t:[],d:[]}
            }

            let town_id = this.DB.soft[way.town_id] ? this.DB.soft[way.town_id] : way.town_id

            if (way.start) {
                this.s_table[way.checkin_id].t[town_id] = true
            }
            else {
                this.s_table[way.checkin_id].d[town_id] = true
            }
        },
        // Подбор checkin_id для колеекции this.ids
        searchFilter(callback)
        {
            if (this.checkin_id) {
                callback([this.checkin_id])
                this.checkin_id = null;
                return
            }

            let ids = [], he = true;
            for (let i in this.DB.checkins)
            {
                let checkin = this.DB.checkins[i]

                // Days test
                he = this.searchTest(checkin.days, this.form.days.value)
                if (!he) {
                    continue
                }

                // Ship test
                he = this.searchTest(checkin.ship_id, this.form.ship.value)
                if (!he) {
                    continue
                }

                // Town test
                he = this.fastTownTest(checkin.id)
                if (!he) {
                    continue
                }

                // Dest test
                he = this.fastTownTest(checkin.id, 1)
                if (!he) {
                    continue
                }

                // Date OF test
                if (this.form.date_1) {
                    let date_1 = this.dateToSec(this.form.date_1)
                    he = checkin.date >= date_1
                    if (!he) {
                        continue
                    }
                }

                // Date TO test
                if (this.form.date_2) {
                    let date_2 = this.dateToSec(this.form.date_2)
                    he = checkin.date <= date_2
                    if (!he) {
                        continue
                    }
                }
                ids.push(checkin.id)
            }

            callback(ids)
        },
        // Проверка соответствия значения из итема и элемента формы
        searchTest(item_value, form_value)
        {
            if (!form_value) {
                return true
            }

            item_value = parseInt(item_value)
            if (Array.isArray(form_value)) {
                if (form_value.length === 0) {
                    return true
                }
                if (form_value.indexOf(item_value) !== -1) {
                    return true
                }
            }
            else {
                if (item_value === form_value) {
                    return true
                }
            }
            return false
        },
        // Быстрый поиск по городу
        fastTownTest(checkin_id, table_num)
        {
            if (!table_num) {
                if (!this.form.town.value) {
                    return true
                }
                if (!this.form.town.value.length) {
                    return true
                }
                for (let i in this.form.town.value) {
                    let town_id = this.form.town.value[i]
                    if (this.s_table[checkin_id].t[town_id]) {
                        return true
                    }
                }
            }
            else {
                if (!this.form.dest.value) {
                    return true
                }
                if (!this.form.dest.value.length) {
                    return true
                }
                for (let i in this.form.dest.value) {
                    let town_id = this.form.dest.value[i]
                    if (this.s_table[checkin_id].d[town_id]) {
                        return true
                    }
                }
            }

            return false
        },
        // Собирает id-шники и сортирует их по пакетам запросов (по 15 на страницу)
        idsBuild(ids, callback)
        {
            this.ids = []
            let len = ids.length
            this.find_count = len
            let page = 0
            let item_cnt = 0;
            for (let i=0;i<len;i++) {
                if (item_cnt < this.per_page - 1) {
                    if (!this.ids[page]) {
                        this.ids[page] = []
                    }
                    this.ids[page].push(ids[i])
                    item_cnt++
                }
                else {
                    page++
                    item_cnt = 0;
                    this.ids[page] = []
                    this.ids[page].push(ids[i])
                }
            }
            this.pages_count = this.ids.length
            callback()
        },
        // Сам запрос отправляющий 15 id-шников
        query(page)
        {
            if (page === undefined) {
                page = 0
            }
            this.page = page
            this.sync({
                data: {ids:this.ids[page]},
                method: 'search',
                then: (html_results) => {
                    if (!html_results) {
                        this.result = this.empty_answer
                        return
                    }
                    this.result = html_results.html
                }
            })
        },
        // Получить опции из пресета
        getFilterOptions(callback)
        {
            let search_preset = $('meta[name="search-preset"]')
            if (!search_preset.length) {
                return
            }

            search_preset = JSON.parse(search_preset.attr('content'))

            if (search_preset.d1) {
                this.form.date_1 = search_preset.d1
            }
            if (search_preset.d2) {
                this.form.date_2 = search_preset.d2
            }
            if (search_preset.t1) {
                this.form.town.value = [parseInt(search_preset.t1)]
            }
            if (search_preset.t2) {
                this.form.dest.value = [parseInt(search_preset.t2)]
            }
            if (search_preset.d) {
                this.form.days.value = [parseInt(search_preset.d)]
            }
            if (search_preset.s) {
                this.form.ship.value = [parseInt(search_preset.s)]
            }
            callback()
        },
        // Преобразовать объект в массив
        objToArray(obj, sort)
        {
            let $return = []
            for (let i in obj) {
                $return.push({id:i,name:obj[i]})
            }
            if (sort) {
                $return = this.sortOptions($return)
            }
            return $return
        },
        // Оставить только уникальные записи массива
        uniqueArr(arr)
        {
            let obj = {}
            for (let i = 0; i < arr.length; i++) {
                let str = arr[i]
                obj[str] = true
            }
            return Object.keys(obj)
        },
        // После пагинации двигать вверх
        scrollTop()
        {
            let pos = $('.search-widget').offset().top - 100
            $('body, html').animate({scrollTop: pos}, 300)
        },
        // При нажатии на кнопки пагинации
        goPage(page)
        {
            if (this.ajaxQueryProcess) {
                return
            }
            if (page > this.pages_count - 1) {
                return
            }
            if (page < 0) {
                return
            }
            this.query(page)
            this.scrollTop()
        },
        // Сортировать опции dropdown
        sortOptions(options)
        {
            options.sort(function(a, b) {
                if (a.name > b.name) {
                    return 1
                }
                if (a.name < b.name) {
                    return -1
                }
                return 0
            })
            return options
        },
        // Получить метку конкретного заезда
        // startCheckin()
        // {
        //     let checkin_id_meta = $('checkin-id')
        //     if (checkin_id_meta.length) {
        //         this.checkin_id = checkin_id_meta.attr('id')
        //     }
        // },
    }
}
</script>
