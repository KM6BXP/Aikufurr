package com.aikufurr.FoxoBot;

import java.awt.Color;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class Commands extends ListenerAdapter {
	private static String readAll(Reader rd) throws IOException {
		StringBuilder sb = new StringBuilder();
		int cp;
		while ((cp = rd.read()) != -1) {
			sb.append((char) cp);
		}
		return sb.toString();
	}

	public static JSONObject readListFromUrl(String url) throws IOException, JSONException {
		HttpURLConnection httpcon = (HttpURLConnection) new URL(url).openConnection();
		httpcon.addRequestProperty("User-Agent", "Mozilla/4.0");
		try {
			BufferedReader rd = new BufferedReader(
					new InputStreamReader(httpcon.getInputStream(), Charset.forName("UTF-8")));
			String jsonText = readAll(rd);
			//List<String> json = Arrays.asList(jsonText);
			JSONObject obj = new JSONObject("{'0':" + jsonText + "}");
			return obj;
		} finally {
			httpcon.disconnect();
		}
	}

	public static String getHTML(String urlToRead) throws Exception {
		StringBuilder result = new StringBuilder();
		URL url = new URL(urlToRead);
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.addRequestProperty("User-Agent", "Mozilla/4.0");
		BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
		String line;
		while ((line = rd.readLine()) != null) {
			result.append(line);
		}
		rd.close();
		return result.toString();
	}

	public void onGuildMessageReceived(GuildMessageReceivedEvent event) {
		if (event.getMessage().getAuthor().getId() != event.getJDA().getSelfUser().getId()) {
			String[] args = event.getMessage().getContentRaw().split(" ");
			String prefix = "<@" + event.getJDA().getSelfUser().getId() + ">";
			if (args[0].equalsIgnoreCase(prefix)) {
				if (args[1].equalsIgnoreCase("init")) {
					event.getMessage().addReaction("kade:550137030844088321").queue();
					event.getMessage().addReaction("nicole:550137074515443734").queue();
					event.getMessage().addReaction("riley:550137124222009384").queue();
					event.getMessage().addReaction("rick:550137100234784808").queue();
					event.getMessage().addReaction("harvey:550136985495535616").queue();
					event.getMessage().addReaction("ness:550137053669752849").queue();
				}
				if (args[1].equalsIgnoreCase("ping")) {
					event.getChannel().sendMessage("Pong").queue();
				} else if (args[1].equalsIgnoreCase("help")) {
					if (args.length == 2) {
						EmbedBuilder em = new EmbedBuilder();
						em.setTitle("Help");
						em.setColor(Color.ORANGE);
						em.setDescription("To get more infomation on a command type `help [command]`");
						em.addField("Images",
								String.format("For a list of all the images %s can send, type `help images`",
										event.getJDA().getSelfUser().getName()),
								true);
						event.getChannel().sendMessage(em.build()).queue();
					} else {
						if (args[2].equalsIgnoreCase("images")) {
							try {
								JSONObject apis = readListFromUrl("https://aikufurr.com/api/images");
								JSONArray arrayAPI = apis.getJSONArray("0");
								String[] array = new String[arrayAPI.length()];
								String out = "All images that start with `y` are nsfw";
								for (int i = 0; i < arrayAPI.length(); i++) {
									array[i] = (String) arrayAPI.get(i);
								}
								for (String o : array) {
									int i = o.lastIndexOf("/");
									out += o.substring(i + 1) + "\n";
								}
								EmbedBuilder em = new EmbedBuilder();
								em.setTitle("Help - Images");
								em.setDescription(out);
								event.getChannel().sendMessage(em.build()).queue();
							} catch (Exception e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
						}
					}
				} else {
					try {
						if (event.getChannel().isNSFW() && args[1].startsWith("y")) {
							JSONObject apis = readListFromUrl("https://aikufurr.com/api/images/" + args[1]);
							EmbedBuilder em = new EmbedBuilder();
							em.setImage((String) apis.get("0"));
							event.getChannel().sendMessage(em.build()).queue();
						}
					} catch (Exception e) {
						// TODO: handle exception
						// e.printStackTrace();
					}
				}
			}
		}
	}
}
