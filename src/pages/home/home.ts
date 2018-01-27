import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
import { Storage } from '@ionic/storage';
import { Chart } from 'chart.js';
import { LoadingController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  detailToggle = [];
  objectKeys = Object.keys;
  coins: Object;
  details: Object;
  likedCoins = [];
  chart = [];
  raw = [];
  allcoins:any;

  constructor(public navCtrl: NavController, 
              private _data: DataProvider, 
              private storage: Storage,
              public loading: LoadingController) {

    this.storage.remove('likedCoins');

  }

  ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading...',
      spinner: 'bubbles'
    });

    loader.present().then(() => {

      this._data.allCoins()
        .subscribe(res => {
          this.raw = res['Data'];
          this.allcoins = res['Data'];

          loader.dismiss();

        })
    });
    this.refreshCoins();
  }


  ionViewWillEnter() {

  }

  refreshCoins() {

    let loader = this.loading.create({
      content: 'Loading...',
      spinner: 'bubbles'
    });

    loader.present().then(() => {

      this.storage.get('likedCoins').then((val) => {

        // If the value is not set, then:
        if(!val) {
          this.likedCoins.push('BTC','ETH','BCH','LTC','BTG','IOT','ETC');
          this.storage.set('likedCoins', this.likedCoins);

          this._data.getCoins(this.likedCoins)
            .subscribe(res => {
              this.coins = res;
              loader.dismiss();
            })
        }
        // It's set
        else {
          this.likedCoins = val;

          this._data.getCoins(this.likedCoins)
          .subscribe(res => {
            this.coins = res;
            loader.dismiss();
          })
        }

      });

    });

  }

  coinDetails(coin,index) {

    if (this.detailToggle[index])
      this.detailToggle[index] = false;
    else {
      this.detailToggle.fill(false);
      this._data.getCoin(coin)
        .subscribe(res => {
          this.details = res['DISPLAY'][coin]['USD'];

          this.detailToggle[index] = true;

          this._data.getChart(coin)
          .subscribe(res => {

       //     console.log(res);

            let coinHistory = res['Data'].map((a) => (a.close));

            setTimeout(()=> {
              this.chart[index] = new Chart('canvas'+index, {
                type: 'line',
                data: {
                  labels: coinHistory,
                  datasets: [{
                      data: coinHistory,
                      borderColor: "#3cba9f",
                      fill: false
                    }
                  ]
                },
                options: {
                  tooltips: {
                    callbacks: {
                        label: function(tooltipItems, data) {
                            return "$" + tooltipItems.yLabel.toString();
                        }
                      }
                    },
                    responsive: true,
                    legend: {
                      display: false
                  },
                  scales: {
                    xAxes: [{
                      display: false
                    }],
                    yAxes: [{
                      display: false
                    }],
                  }
                }
              });
            }, 250);

          });


        });


      }

  }

  swiped(index) {
    this.detailToggle[index] = false;
  }

  removeCoin(coin) {
    this.detailToggle.fill(false);

    this.likedCoins = this.likedCoins.filter(function(item) {
      return item !== coin
    });

    this.storage.set('likedCoins', this.likedCoins);

    setTimeout(() => {
      this.refreshCoins();
    }, 300);
  }

  showSearch() {
    this.navCtrl.push("SearchPage");
  }

  doRefresh(refresher) {
 //   console.log('Begin async operation', refresher);
    this.refreshCoins();
    setTimeout(() => {
  //    console.log('Async operation has ended');
      refresher.complete();
    }, 500);
  }

}
