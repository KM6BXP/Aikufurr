package com.aikufurr.FoxoBot;

import javax.security.auth.login.LoginException;

import net.dv8tion.jda.api.AccountType;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;

public class FoxoBot {
	public static JDA jda;

	// Start
	public static void main(String[] args) throws LoginException, InterruptedException {
		jda = new JDABuilder(AccountType.BOT).setToken("")
				.build();
		jda.getPresence().setActivity(Activity.watching("Foxes"));
		jda.addEventListener(new Commands());
		jda.addEventListener(new GenericMessageReactionAdd());
		jda.awaitReady();
		System.out.println("Logged in as: " + jda.getSelfUser().getName());
	}
}
