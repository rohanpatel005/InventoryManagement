import "dotenv";
import bcrypt from "bcrypt";
import { AppDataSource } from "../server";
import { Users, Role } from "../entities/user";

async function seedAdmin(): Promise<void> {
    const {
        ADMIN_NAME,
        ADMIN_NUMBER,
        ADMIN_EMAIL,
        ADMIN_PASSWORD,
        ADMIN_ADDRESS,
    } = process.env;

    if (
        !ADMIN_NAME ||
        !ADMIN_NUMBER ||
        !ADMIN_EMAIL ||
        !ADMIN_PASSWORD ||
        !ADMIN_ADDRESS
    ) {
        throw new Error("Missing admin environment variables");
    }

    if (ADMIN_PASSWORD.length < 8) {
        throw new Error(
            "Admin password must be at least 8 characters"
        );
    }

    if (!/^\d{10}$/.test(ADMIN_NUMBER)) {
        throw new Error(
            "ADMIN_NUMBER must contain exactly 10 digits"
        );
    }

    let initializedHere = false;

    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            initializedHere = true;
        }

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const existingAdmin = await Users.findOneBy({ email });

        if (existingAdmin) {
            console.log(
                "An account with this email already exists. No changes made."
            );
            return;
        }

        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            12
        );

        const admin = Users.create({
            name: ADMIN_NAME,
            number: ADMIN_NUMBER,
            email,
            password: hashedPassword,
            address: ADMIN_ADDRESS,
            role: Role.ADMIN,
        });

        await admin.save();

        console.log("Admin created successfully.");
    } finally {
        if (initializedHere && AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedAdmin().catch((error: unknown) => {
    console.error(
        "Admin seeding failed:",
        error instanceof Error ? error.message : "Unknown error"
    );

    process.exitCode = 1;
});