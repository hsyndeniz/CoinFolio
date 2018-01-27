import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, ToastController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  objectKeys = Object.keys;
  likedCoins = [];
  raw = [];
  liked = [];
  allcoins:any;
  filteredItems: any;
  searchTerm: string;

  constructor(private storage: Storage, 
              private _data: DataProvider, 
              public loading: LoadingController, 
              public navCtrl: NavController, 
              public navParams: NavParams,
              public events: Events,
              private toastCtrl: ToastController) {}
  
  ionViewWillLeave() {
    this.events.publish('coin:event');
  }

  ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading Coins..',
      spinner: 'bubbles'
    });

    loader.present().then(() => {

      this.storage.get('likedCoins').then((val) => {
        this.likedCoins = val;
      });

      this._data.allCoins()
        .subscribe(res => {
          this.raw = res['Data'];
          this.allcoins = res['Data'];

          loader.dismiss();

          this.storage.get('likedCoins').then((val) => {
            this.liked = val;
          })

        })
    });
  }

  addCoin(coin) {
    if (this.likedCoins.includes(coin)) {
      let index = this.likedCoins.indexOf(coin);
      this.likedCoins.splice(index, 1);
      this.storage.set('likedCoins',this.likedCoins);
      this.showToast(this.allcoins[coin].CoinName, 'removed')
    }
    else {
      this.likedCoins.push(coin);
      this.storage.set('likedCoins',this.likedCoins);
      this.showToast(this.allcoins[coin].CoinName, 'added')
    }
    
  }

  showToast(msg: string, action: string) {
    let toast = this.toastCtrl.create({
      message: msg + ' was ' + action + ' successfully',
      duration: 3000,
      position: 'bottom'
    });
  
    toast.present();
  }

  searchCoins() {

    this.allcoins = this.raw;

    if (this.searchTerm && this.searchTerm.trim() != '') {

      const filtered = Object.keys(this.allcoins)
        .filter(key => this.searchTerm.toUpperCase().includes(key))
        .reduce((obj,key) => {
          obj[key] = this.allcoins[key];
          return obj;
        }, {});

      this.allcoins = filtered;
      this.filteredItems = filtered

    }

    else {
      this.filteredItems = [];
    }
  }

  onCancelSearch() {
    this.filteredItems = [];
  }

}
