-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Members" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "certificate" TEXT,
    "photo" TEXT,
    "gender" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "joining_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "biography" TEXT,

    CONSTRAINT "Members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "id" SERIAL NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "contact_info" TEXT NOT NULL,
    "payment_info_cbe" TEXT,
    "payment_info_coop" TEXT,
    "payment_info_boa" TEXT,
    "payment_info_awash" TEXT,
    "payment_info_ebirr" TEXT,
    "location" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DosageForms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DosageForms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicines" (
    "id" SERIAL NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "dosage_form_id" INTEGER NOT NULL,
    "medicine_weight" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "expire_date" TIMESTAMP(3) NOT NULL,
    "required_prescription" BOOLEAN NOT NULL,
    "payment_method" TEXT NOT NULL,
    "Payment_file" TEXT,
    "details" TEXT,

    CONSTRAINT "Medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sales" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_batch_number" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "prescription" BOOLEAN NOT NULL,
    "dosage_form_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "sealed_date" TIMESTAMP(3) NOT NULL,
    "medicine_id" INTEGER NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expenses" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "receipt" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "additional_info" TEXT,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Returns" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_batch_number" TEXT NOT NULL,
    "dosage_form_id" INTEGER NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "reason_for_return" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "medicine_id" INTEGER NOT NULL,

    CONSTRAINT "Returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCredits" (
    "id" SERIAL NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "credit_amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "credit_date" TIMESTAMP(3) NOT NULL,
    "payment_file" TEXT,

    CONSTRAINT "SupplierCredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerCredit" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "credit_amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "credit_date" TIMESTAMP(3) NOT NULL,
    "payment_file" TEXT,

    CONSTRAINT "CustomerCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objectives" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time_period" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResults" (
    "id" SERIAL NOT NULL,
    "objective_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "KeyResults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Members_user_id_key" ON "Members"("user_id");

-- AddForeignKey
ALTER TABLE "Members" ADD CONSTRAINT "Members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_dosage_form_id_fkey" FOREIGN KEY ("dosage_form_id") REFERENCES "DosageForms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicines" ADD CONSTRAINT "Medicines_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_dosage_form_id_fkey" FOREIGN KEY ("dosage_form_id") REFERENCES "DosageForms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "Medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_dosage_form_id_fkey" FOREIGN KEY ("dosage_form_id") REFERENCES "DosageForms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "Medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierCredits" ADD CONSTRAINT "SupplierCredits_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerCredit" ADD CONSTRAINT "CustomerCredit_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResults" ADD CONSTRAINT "KeyResults_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "Objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
