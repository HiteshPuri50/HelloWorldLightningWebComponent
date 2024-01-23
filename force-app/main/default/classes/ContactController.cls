public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        // System.debug('### getContacts method called');
        // // Your logic to fetch contacts
        // List<Contact> contacts = [SELECT Id, FirstName, LastName, Email FROM Contact];
        // System.debug('### Contacts: ' + contacts);
        // return contacts;
        throw new AuraHandledException('Forced error');
    }
}