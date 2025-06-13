import React from 'react';

type ManageCategoriesPageProps = {
    userId: string | null;
};

export const ManageCategoriesPage: React.FC<ManageCategoriesPageProps> = ({ userId }) => {
    return (
        <div>
            <h2>Manage Categories</h2>
            <p>User ID: {userId}</p>
            {/* Add your category management UI here */}
        </div>
    );
};