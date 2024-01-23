import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactController.getContacts';
import { reduceErrors } from 'c/ldsUtils';
// import FirstName from '@salesforce/schema/Contact.FirstName';
// import LastName from '@salesforce/schema/Contact.LastName';
// import Email from '@salesforce/schema/Contact.Email';

const Columns = [
    {label : 'FirstName', fieldName: 'FirstName', type: 'text'},
    {label : 'LastName', fieldName: 'LastName', type: 'text'},
    {label : 'Email', fieldName: 'Email', type: 'text'}
]

export default class ContactList extends LightningElement {
    errors;
    contactData;
    col = Columns;
    @wire(getContacts) getContacts (result){
        const {data, error} = result;
        if(data){
            this.contactData = data;
            console.log(data);
        }else{
            this.errors = reduceErrors(error)
        }
    }
    // get errors() {
    //     return (this.accounts.error) ?
    //         reduceErrors(this.accounts.error) : [];
    // }
}