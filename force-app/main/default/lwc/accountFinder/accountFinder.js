import { LightningElement, wire } from 'lwc';
import queryAccountsByRevenue from '@salesforce/apex/AccountListControllerLwc.queryAccountsByRevenue';
import { NavigationMixin } from 'lightning/navigation';
export default class AccountFinder extends NavigationMixin(LightningElement) {
    annualRevenue = null;
    @wire(queryAccountsByRevenue, {annualRevenue : '$annualRevenue'})
    accounts;
    handleChange(event){
        this.annualRevenue = event.detail.value;
    }
    reset(){
        this.annualRevenue = null;
    }
    recordPageUrl;
    Navbar(){
        console.log(this.recordPageUrl);
        this[NavigationMixin.Navigate]({
            type : 'standard_objectPage',
            attribute :{
                objectApiName: 'Account',
                recordId : '0015i000011BkXLAA0',
                actionName:'view',
            }
        }).then((url) => {
            this.recordPageUrl = url;
            console.log(this.recordPageUrl);
        });
    }
}