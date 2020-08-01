$(function() {
  var app = new Vue({
    el: '#main',
    data: {
      leftBar: false,
      rightBar: false,
      hideSuspend: false,
      settingVisible: false,
      nav: [
        { id: 1, name: '菜谱', icon: 'el-icon-food' },
        { id: 2, name: '厨师', icon: 'el-icon-user' },
        { id: 3, name: '厨具', icon: 'el-icon-knife-fork' },
        { id: 4, name: '装修', icon: 'el-icon-refrigerator' },
        { id: 5, name: '采集', icon: 'el-icon-chicken' },
        { id: 6, name: '任务', icon: 'el-icon-document' },
        { id: 7, name: '计算器', icon: 'el-icon-set-up' },
        { id: 8, name: '个人', icon: 'el-icon-user' },
        { id: 9, name: '说明', icon: 'el-icon-info' },
      ],
      navId: 1,
      tableHeight: window.innerHeight - 122,
      data: [],
      recipes: [],
      recipesPage: [],
      repCol: {
        id: false,
        rarity: false,
        skills: false,
        materials: false,
        price: true,
        exPrice: false,
        time: true,
        limit: false,
        total_price: false,
        total_time_show: false,
        gold_eff: true,
        material_eff: false,
        origin: true,
        unlock: false,
        combo: false,
        guests: false,
        degree_guests: false,
        gift: false,
      },
      repColName: {
        id: '编号',
        rarity: '星级',
        skills: '技法',
        materials: '材料',
        price: '单价',
        exPrice: '熟练加价',
        time: '单时间',
        limit: '一组',
        total_price: '总价',
        total_time_show: '总时间',
        gold_eff: '金币效率',
        material_eff: '总耗材效率',
        origin: '来源',
        unlock: '解锁',
        combo: '合成',
        guests: '贵客',
        degree_guests: '升阶贵客',
        gift: '神级符文',
      },
      repFilter: {
        rarity: {
          1: true,
          2: true,
          3: true,
          4: true,
          5: true
        },
        skill: {
          stirfry: { name: '炒', flag: true },
          boil: { name: '煮', flag: true },
          knife: { name: '切', flag: true },
          fry: { name: '炸', flag: true },
          bake: { name: '烤', flag: true },
          steam: { name: '蒸', flag: true },
        },
        material: {
          vegetable: { name: '菜', flag: true },
          meat: { name: '肉', flag: true },
          creation: { name: '面', flag: true },
          fish: { name: '鱼', flag: true },
        },
        material_type: false,
        guest: false,
        combo: false,
        price: '',
      },
      material_type: [
        {
          origin: ['菜棚', '菜地', '森林'],
          type: 'vegetable'
        },
        {
          origin: ['鸡舍', '猪圈', '牧场'],
          type: 'meat'
        },
        {
          origin: ['作坊'],
          type: 'creation'
        },
        {
          origin: ['池塘'],
          type: 'fish'
        },
      ],
      skill_radio: false,
      skill_type: false,
      repKeyword: '',
      guestKeyword: '',
      recipesCurPage: 1,
      recipesPageSize: 20,
      questsType: 1,
      questsTypes: [{
        value: 1,
        label: '主线任务'
      }, {
        value: 2,
        label: '支线任务'
      }],
      questsKeyword: '',
      questsMain: [],
      questsPage: [],
      questsRegional: [],
      questsCurPage: 1,
      questsPageSize: 20,
    },
    mounted() {
      $('#main').height(window.innerHeight);
      this.loadData();
    },
    methods: {
      loadData() {
        $.ajax({
          url: './data/data.min.json'
        }).then(rst => {
          this.data = rst;
          this.initData();
        });
      },
      checkNav(id) {
        this.navId = id;
        this.leftBar = false;
      },
      initData() {
        const combo_recipes = this.data.recipes.slice(-8);
        this.data.recipes = this.data.recipes.map(item => {
          item.rarity_show = '★★★★★'.slice(0, item.rarity);
          const skill_arr = ['stirfry', 'boil', 'knife', 'fry', 'bake', 'steam'];
          for (let i of skill_arr) {
            item[i] = item[i] || null;
          }
          let materials_cnt = 0;
          item.materials_show = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            materials_cnt += m.quantity;
            return `${name}*${m.quantity}`;
          }).join(' ');
          item.materials_search = item.materials.map(m => {
            const name = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).name;
            return name;
          }).join(' ');
          item.materials_type = item.materials.map(m => {
            const origin = this.data.materials.find(i => {
              return i.materialId == m.material;
            }).origin;
            const m_type = this.material_type.find(t => {
              return t.origin.indexOf(origin) > -1;
            }).type;
            return m_type;
          });
          item.materials_type = Array.from(new Set(item.materials_type));
          item.origin = item.origin.replace('<br>', '\n');
          item.time_show = this.formatTime(item.time);
          item.gold_eff = Math.round(3600 / item.time * item.price);
          item.total_price = item.price * item.limit;
          item.total_time = item.time * item.limit;
          item.total_time_show = this.formatTime(item.total_time);
          item.material_eff = ~~(3600 / item.time * materials_cnt);
          item.combo = [];
          for (const i of this.data.combos) {
            if (i.recipes.indexOf(item.recipeId) > -1) {
              const combo = combo_recipes.find(r => {
                return r.recipeId === i.recipeId;
              });
              item.combo.push(combo.name);
            }
          }
          item.combo = item.combo.join('\n');
          item.degree_guests = item.guests.map((g, i) => {
            return `${'优特神'.slice(i, i + 1)}-${g.guest}`;
          }).join('\n');
          const guests = [];
          for (const g of this.data.guests) {
            const rep = g.gifts.map(r => r.recipe);
            const index = rep.indexOf(item.name);
            if (index > -1) {
              guests.push(`${g.name}-${g.gifts[index].antique}`);
            }
          }
          item.normal_guests = guests.join('\n');
          return item;
        });
        this.initRep();
      },
      initRep() {
        this.recipes = [];
        for (const item of this.data.recipes) {
          const s_name = item.name.indexOf(this.repKeyword) > -1;
          const s_origin = item.origin.indexOf(this.repKeyword) > -1;
          const s_material = item.materials_search.indexOf(this.repKeyword) > -1;
          const s_guest = item.normal_guests.indexOf(this.repKeyword) > -1;
          const search = s_name || s_origin || s_material || s_guest;
          const g_name = item.degree_guests.indexOf(this.guestKeyword) > -1;
          const g_gift = item.gift.indexOf(this.guestKeyword) > -1;
          const guest = g_name || g_gift;
          const f_rarity = this.repFilter.rarity[item.rarity];
          let f_skill = this.skill_type;
          for (const key in this.repFilter.skill) {
            if (this.repFilter.skill[key].flag) {
              if (this.skill_type) {
                f_skill = f_skill && Boolean(item[key]);
              } else {
                f_skill = f_skill || Boolean(item[key]);
              }
            }
          }
          let f_material = this.repFilter.material_type;
          for (const key in this.repFilter.material) {
            if (this.repFilter.material[key].flag) {
              if (this.repFilter.material_type) {
                f_material = f_material && (item.materials_type.indexOf(key) > -1);
              } else {
                f_material = f_material || (item.materials_type.indexOf(key) > -1);
              }
            }
          }
          const f_guest = !this.repFilter.guest || item.normal_guests;
          const f_combo = !this.repFilter.combo || item.combo;
          const f_price = item.price > this.repFilter.price;
          if (search && guest && f_rarity && f_skill && f_material && f_guest && f_combo && f_price) {
            this.recipes.push(item);
          }
        }
        this.recipesCurPage = 1;
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
        this.$nextTick(() => {
          this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
          this.$refs.recipesTable.clearSort();
        });
      },
      formatTime(sec) {
        return (sec >= 3600 ? `${~~(sec / 3600)}小时` : '') + ((sec % 3600) >= 60 ? `${~~((sec % 3600) / 60)}分` : '') + ((sec % 3600) % 60 !== 0 ? `${(sec % 3600) % 60}秒` : '')
      },
      handleCurrentChange(val) {
        if (this.navId === 1) {
          this.recipesCurPage = val;
          const size = this.recipesPageSize;
          this.recipesPage = this.recipes.slice((val - 1) * size, val * size);
        } else if (this.navId === 6) {
          this.questsCurPage = val;
          const size = this.questsPageSize;
          const quests = this.questsType === 1 ? this.questsMain : this.questsRegional;
          this.questsPage = quests.slice((val - 1) * size, val * size);
          this.$refs.questsTable.bodyWrapper.scrollTop = 0;
        }
      },
      handleRepSort(sort) {
        const map = {
          time_show: 'time',
          rarity_show: 'rarity',
          total_time_show: 'total_time'
        };
        if (!sort.order) {
          this.initRep();
        }
        sort.prop = map[sort.prop] || sort.prop;
        this.recipesCurPage = 1;
        this.recipes.sort(this.customSort(sort));
        this.recipesPage = this.recipes.slice(0, this.recipesPageSize);
      },
      handleQuestsSort(sort) {
        if (!sort.order) {
          this.initQuests();
        }
        this.questsCurPage = 1;
        if (this.questsType === 1) {
          this.questsMain.sort(this.customSort(sort));
          this.questsPage = this.questsMain.slice(0, this.questsPageSize);
        } else {
          this.questsRegional.sort(this.customSort(sort));
          this.questsPage = this.questsRegional.slice(0, this.questsPageSize);
        }
      },
      customSort(sort) {
        const map = {
          ascending: -1,
          descending: 1,
        }
        function sortFunc(x, y) {
          if (x[sort.prop] < y[sort.prop]) {
            return map[sort.order];
          } else if (x[sort.prop] > y[sort.prop]) {
            return 0 - map[sort.order];
          } else {
            return 0;
          }
        }
        return sortFunc;
      },
      initQuests() {
        const key = this.questsKeyword;
        this.questsCurPage = 1;
        this.questsMain = [];
        this.questsRegional = [];
        for (let item of this.data.quests) {
          const rewards = item.rewards.map(r => {
            return r.quantity ? `${r.name} * ${r.quantity}` : r.name;
          });
          item.rewards_show = rewards.join('\n');
          const search = String(item.questId).indexOf(key) > -1 || item.goal.indexOf(key) > -1 || item.rewards_show.indexOf(key) > -1;
          if (item.type === '主线任务' && search) {
            this.questsMain.push(item);
          } else if (item.type === '支线任务' && search) {
            this.questsRegional.push(item);
          }
        }
        this.questsPage = this.questsType == 1 ? this.questsMain.slice(0, this.questsPageSize) : this.questsRegional.slice(0, this.questsPageSize);
        this.$nextTick(() => {
          this.$refs.questsTable.bodyWrapper.scrollTop = 0;
          this.$refs.questsTable.clearSort();
        });
      },
      selectAll(obj, k) {
        let flag = false;
        if (obj === 'repFilter.skill') {
          this.skill_radio = false;
          this.skill_type = false;
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          for (const key in skill) {
            if (!skill[key].flag) {
              flag = true;
            }
          }
          for (const key in skill) {
            skill[key].flag = flag;
          }
          this.repFilter.skill = skill;
        } else {
          for (const key in this[obj]) {
            if (!this[obj][key]) {
              flag = true;
            }
          }
          for (const key in this[obj]) {
            this[obj][key] = flag;
          }
        }
      },
      checkSkill(key) {
        if (this.skill_radio) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          for (const k in skill) {
            if (k === key) {
              skill[k].flag = !skill[k].flag;
            } else {
              skill[k].flag = false;
            }
          }
          this.repFilter.skill = skill;
        } else {
          this.repFilter.skill[key].flag = !this.repFilter.skill[key].flag;
        }
      },
      changeSkillRadio(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 1) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.repFilter.skill = skill;
          }
        }
      },
      changeSkillType(val) {
        if (val) {
          const skill = JSON.parse(JSON.stringify(this.repFilter.skill));
          let cnt = 0;
          for (const key in skill) {
            if (skill[key].flag) {
              cnt++;
            }
          }
          if (cnt > 2) {
            for (const key in skill) {
              skill[key].flag = false;
            }
            this.repFilter.skill = skill;
          } else {
            this.initRep();
          }
        } else {
          this.initRep();
        }
      },
      reset() {
        if (this.navId === 1) {
          this.repFilter = {
            rarity: {
              1: true,
              2: true,
              3: true,
              4: true,
              5: true
            },
            skill: {
              stirfry: { name: '炒', flag: true },
              boil: { name: '煮', flag: true },
              knife: { name: '切', flag: true },
              fry: { name: '炸', flag: true },
              bake: { name: '烤', flag: true },
              steam: { name: '蒸', flag: true },
            },
            material: {
              vegetable: { name: '菜', flag: true },
              meat: { name: '肉', flag: true },
              creation: { name: '面', flag: true },
              fish: { name: '鱼', flag: true },
            },
            material_type: false,
            guest: false,
            combo: false,
          };
          this.skill_radio = false;
          this.skill_type = false;
        }
      }
    },
    watch: {
      repCol: {
        deep: true,
        handler() {
          this.$nextTick(()=>{
            this.$refs.recipesTable.doLayout();
          });
        }
      },
      repFilter: {
        deep: true,
        handler() {
          this.initRep();
          this.$nextTick(()=>{
            this.$refs.recipesTable.doLayout();
          });
        }
      },
      repKeyword() {
        this.initRep();
      },
      guestKeyword() {
        this.initRep();
      },
      questsType() {
        this.initQuests();
      },
      questsKeyword() {
        this.initQuests();
      },
      navId(val) {
        if (val === 1) {
          this.initRep();
          this.$nextTick(()=>{
            this.$refs.recipesTable.bodyWrapper.scrollTop = 0;
            this.$refs.recipesTable.bodyWrapper.scrollLeft = 0;
            this.$refs.recipesTable.doLayout();
          });
        } else if (val === 6) {
          this.initQuests();
        }
      }
    }
  });
});