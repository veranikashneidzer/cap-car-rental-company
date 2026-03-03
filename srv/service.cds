using sap.carRentalCompany from '../db/schema.cds';

service CarRentalCompanyService {
    @odata.draft.enabled
    entity Cars as projection on carRentalCompany.Cars;
    entity Customers as projection on carRentalCompany.Customers;
    @odata.draft.enclosed
    entity Rentals as projection on carRentalCompany.Rentals;
    entity Maintenance as projection on carRentalCompany.Maintenance;
}

annotate carRentalCompany.Cars with @Capabilities.InsertRestrictions.Insertable : true;
annotate carRentalCompany.Maintenance with @Capabilities.InsertRestrictions.Insertable : true;
annotate carRentalCompany.Rentals with @Capabilities.InsertRestrictions.Insertable : false;
