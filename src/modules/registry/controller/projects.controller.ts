import {Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put, Delete} from '@nestjs/common';
import {HttpException} from "@nestjs/core";
import {ProjectsService} from "../service/projects.service";
import {State, Project} from "../entity/project.entity";
import {CreateProjectDto, CreativeFounder} from "../dto/create-project.dto";
import {UsersService} from "../service/users.service";
import {User} from "../entity/user.entity";
import {Membership, Role} from "../entity/membership.entity";
import {MembershipService} from "../service/membership.service";
import {EmailService} from "../service/email.service";

@Controller()
export class ProjectsController {
	constructor(private projectsService: ProjectsService,
	            private usersService: UsersService,
	            private membershipService: MembershipService,
	            private emailService: EmailService) {
	}

	@Post('api/project')
	public async add(@Req() req,
	                 @Res() res: Response,
	                 @Body() createProjectDto: CreateProjectDto) {

		console.log('Adding a new project: ' + JSON.stringify(createProjectDto))

		if (req.jwt.address !== createProjectDto.address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		// we can add projects in Initiating or AwaitingConfirmation states only
		if (createProjectDto.state != State.AwaitingConfirmation &&
			createProjectDto.state != State.Initiating)
			throw new HttpException("Invalid project state!", HttpStatus.BAD_REQUEST);

		// each projects must have a name (regardless of the state)
		if (!createProjectDto.name)
			throw new HttpException("Project name must be set!", HttpStatus.BAD_REQUEST);

		// each project must have an address (regardless of the state)
		if (!createProjectDto.address)
			throw new HttpException("Address must be set!", HttpStatus.BAD_REQUEST);

		if (createProjectDto.state == State.AwaitingConfirmation) {

			// awaiting confirmation project must have email
			if (!createProjectDto.projectEmail)
				throw new HttpException("Project email must be set!", HttpStatus.BAD_REQUEST);

			// awaiting confirmation projects must have details
			// todo: check the vailidy of the json as well, invalid jsons may produce db errors
			if (!createProjectDto.details)
				throw new HttpException("Project description must be set!", HttpStatus.BAD_REQUEST);

			// awaiting confirmation projects must have at least one creative founder
			if (createProjectDto.creativeFounders.length == 0)
				throw new HttpException("Project must have at least one creative founder!", HttpStatus.BAD_REQUEST);
		}

		// check if the project already exist
		const existing = await this.projectsService.getByAddress(createProjectDto.address);
		if (existing) {
			throw new HttpException("Project already exists. Use update project to change values.", HttpStatus.BAD_REQUEST);
		}

		// create and persist the new project
		let newProject: Project = new Project();
		newProject.name = createProjectDto.name;
		newProject.email = createProjectDto.projectEmail;
		newProject.state = createProjectDto.state;
		newProject.address = createProjectDto.address;
		newProject.details = createProjectDto.details;
		let addedProject = await this.projectsService.add(newProject);
		if(!addedProject)
			throw new HttpException('Could not create project', HttpStatus.EXPECTATION_FAILED);

		// create and persist the project initiator membership
		let newMembership: Membership = new Membership();
		newMembership.role = Role.ProjectInitiator;
		newMembership.project = addedProject;
		newMembership.user = await this.usersService.getByAddress(createProjectDto.initiatorAddress);
		// todo: figure out the tals for the initiator
		let addedMembership = await this.membershipService.add(newMembership);
		if(!addedMembership)
			throw new HttpException('Could not create project', HttpStatus.EXPECTATION_FAILED);

		// for each creative founder
		for (let creativeFounder of createProjectDto.creativeFounders) {

			// create the creative founder membership
			newMembership.role = Role.CreativeFounder;
			newMembership.project = newProject;
			newMembership.silverTals = creativeFounder.silvertals;
			newMembership.copperTals = creativeFounder.coppertals;

			// create user stub for each unused email address
			let existingUser: User = await this.usersService.getByEmail(creativeFounder.email)
			if (!existingUser) {
				let user: User = new User();
				user.email = creativeFounder.email;
				user.name = creativeFounder.name;
				user.mobile = creativeFounder.mobile;

				// synchronously persist the user
				let newUser: User = await this.usersService.add(user);
				if(!newUser)
					throw new HttpException('Could not create new user for project', HttpStatus.EXPECTATION_FAILED);

				// tie the membership to the new user
				newMembership.user = newUser;
			} else {
				// otherwise, tie the membership to the existing user
				newMembership.user = existingUser;
			}

			// synchronously persist the creative founder membership
			let addedMembership = await this.membershipService.add(newMembership);
			if(!addedMembership)
				throw new HttpException('Could not create membership', HttpStatus.EXPECTATION_FAILED);

			// asynchronously send an invitation email, only if the project awaits confirmation
			if (newProject.state == State.AwaitingConfirmation)
				this.emailService.emailProjectInvitation(newMembership.user.email, newProject.name);
		}

		console.log('Added project: ' + JSON.stringify(newProject));

		res.status(HttpStatus.CREATED).json(newProject);
	}

	@Post('api/project')
	public async update(@Req() req,
	                    @Res() res: Response,
	                    @Body() createProjectDto: CreateProjectDto) {

		console.log('Updating the project ' + JSON.stringify(createProjectDto));

		if (req.jwt.address !== createProjectDto.address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		const existingProject = await this.projectsService.getByAddress(createProjectDto.address);
		if (!existingProject) {
			throw new HttpException("No such project. Use Create project first", HttpStatus.BAD_REQUEST);
		}

		// we can update initiating projects only
		if (existingProject.state != State.Initiating) {
			throw new HttpException("Project cannot be updated", HttpStatus.BAD_REQUEST);
		}

		// we can update projects to Initiating or AwaitingConfirmation states only
		if (createProjectDto.state != State.AwaitingConfirmation &&
			createProjectDto.state != State.Initiating)
			throw new HttpException("Invalid project state!", HttpStatus.BAD_REQUEST);

		// each projects must have a name (regardless of the state)
		if (!createProjectDto.name)
			throw new HttpException("Project name must be set!", HttpStatus.BAD_REQUEST);

		// each project must have address (regardless of the state)
		if (!createProjectDto.address)
			throw new HttpException("Address must be set!", HttpStatus.BAD_REQUEST);

		if (createProjectDto.state == State.AwaitingConfirmation) {

			// awaiting confirmation project must have email
			if (!createProjectDto.projectEmail)
				throw new HttpException("Project email must be set!", HttpStatus.BAD_REQUEST);

			// awaiting confirmation projects must have details
			// todo: check the vailidy of the json as well, invalid jsons may produce db errors
			if (!createProjectDto.details)
				throw new HttpException("Project description must be set!", HttpStatus.BAD_REQUEST);

			// awaiting confirmation projects must have at least one creative founder
			if (createProjectDto.creativeFounders.length == 0)
				throw new HttpException("Project must have at least one creative founder!", HttpStatus.BAD_REQUEST);
		}

		// update the existing project
		existingProject.name = createProjectDto.name;
		existingProject.email = createProjectDto.projectEmail;
		existingProject.state = createProjectDto.state;
		existingProject.address = createProjectDto.address;
		existingProject.details = createProjectDto.details;

		// synchronously update the existing project
		let updatedProject = await this.projectsService.update(existingProject);
		if(!updatedProject)
			throw new HttpException('Could not update project', HttpStatus.EXPECTATION_FAILED);

		//remove all the creative founder memberships tied to the existing project
		let memberships: Membership[] = await this.membershipService.getAllByProjectAddress(existingProject.address, Role.CreativeFounder);
		for (let membership of memberships) {
			await this.membershipService.remove(membership);
		}

		// for each creative founder
		for (let creativeFounder of createProjectDto.creativeFounders) {

			// create the creative founder membership
			let membership: Membership = new Membership();
			membership.role = Role.CreativeFounder;
			membership.project = existingProject;
			membership.silverTals = creativeFounder.silvertals;
			membership.copperTals = creativeFounder.coppertals;

			// create user stub for each unused email address
			let existingUser: User = await this.usersService.getByEmail(creativeFounder.email);
			if (!existingUser) {
				let user: User = new User();
				user.email = creativeFounder.email;
				user.name = creativeFounder.name;
				user.mobile = creativeFounder.mobile;

				// synchronously persist the user
				let newUser: User = await this.usersService.add(user);
				if(!newUser)
					throw new HttpException('Could not create user for project', HttpStatus.EXPECTATION_FAILED);

				// tie the membership to the new user
				membership.user = newUser;
			} else {
				// otherwise, tie the membership to the existing user
				membership.user = existingUser;
			}

			// synchronously persist the creative founder membership
			await this.membershipService.add(membership);

			// asynchronously send an invitation email, only if the project awaits confirmation
			if (existingProject.state == State.AwaitingConfirmation)
				this.emailService.emailProjectInvitation(membership.user.email, existingProject.name);
		}

		console.log('The existing project has been updated: ' + JSON.stringify(existingProject));

	}

	@Get('api/project/:address')
	public async getByAddress(@Req() req,
	                          @Res() res: Response,
	                          @Param('address') address) {

		console.log('Getting an existing project by address ' + address);

		if (req.jwt.address !== address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		let existingProject = await this.projectsService.getByAddress(address);
		if (!existingProject)
			throw new HttpException('No such project', HttpStatus.EXPECTATION_FAILED);


		console.log('Got existing project ' + JSON.stringify(existingProject));

		res.status(HttpStatus.OK).json(existingProject);
	}

	// todo: maybe add a 'get all by initiator'? would make the mobile app life much easier
}