package com.aikufurr.modules;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Conversion {
    public ArrayList<String> stringToArrayList(String list) {
        ArrayList<String> allMatches = new ArrayList<String>();
        Matcher m = Pattern.compile("([\"'])(?:(?=(\\\\?))\\2.)*?\\1").matcher(list);
        while (m.find()) {
            allMatches.add(m.group());
        }
        return allMatches;
    }
}
