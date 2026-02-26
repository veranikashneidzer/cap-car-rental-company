using sap.carRentalCompany from '../db/schema.cds';

service CarRentalCompanyService {
    entity Cars as projection on carRentalCompany.Cars;
    entity Customers as projection on carRentalCompany.Customers;
    entity Rentals as projection on carRentalCompany.Rentals;
    entity Maintenances as projection on carRentalCompany.Maintenance;
}