public with sharing class CandleStickChartController {
    @AuraEnabled(cacheable=true)
    public static List<Stock_Data__c> getStocksData(Date startDate, Date endDate) {
        return [
            SELECT
                Close_Price__c,
                Date__c,
                High_Price__c,
                Low_Price__c,
                Open_Price__c
            FROM Stock_Data__c
            WHERE Date__c >= :startDate AND Date__c <= :endDate
            ORDER BY Date__c
            LIMIT 50
        ];
    }
}