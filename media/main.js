const createApp = PetiteVue.createApp

createApp({
  // exposed to all expressions
  tabType: 'astTree',

  // methods
  changeTabType(type) {
    this.tabType = type
  }
}).mount()