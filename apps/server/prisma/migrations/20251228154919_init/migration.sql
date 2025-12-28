-- CreateTable
CREATE TABLE "role_permissions" (
    "role_code" VARCHAR(50) NOT NULL,
    "permission_code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_code","permission_code")
);

-- CreateIndex
CREATE INDEX "role_permissions_role_code_idx" ON "role_permissions"("role_code");
