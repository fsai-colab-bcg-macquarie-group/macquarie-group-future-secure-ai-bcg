export type UseCaseTeamDTO = {
    id: string;
    name: string;
    ownerId: string;
    ownerFirstName?: string;
    ownerLastName?: string;
    members?: UseCaseTeamMembers[];
};

export type UseCaseTeamMembers = {
    email: string;
    userId: string;
    lastName: string;
    firstName: string;
    accessName: string;
}