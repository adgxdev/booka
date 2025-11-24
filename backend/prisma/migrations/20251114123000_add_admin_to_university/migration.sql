-- Add adminId column to University and create foreign key constraint
ALTER TABLE "University" ADD COLUMN "adminId" TEXT;

-- Create foreign key referencing Admin(id)
ALTER TABLE "University" ADD CONSTRAINT "University_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "Admin"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
