package com.wealthos.auth.config;

import com.wealthos.auth.model.AdminAccount;
import com.wealthos.auth.model.AdvisorAccount;
import com.wealthos.auth.model.FamilyOfficeAccount;
import com.wealthos.auth.model.InstitutionalAccount;
import com.wealthos.auth.model.InvestorAccount;
import com.wealthos.auth.repository.AdminAccountRepository;
import com.wealthos.auth.repository.AdvisorAccountRepository;
import com.wealthos.auth.repository.FamilyOfficeAccountRepository;
import com.wealthos.auth.repository.InstitutionalAccountRepository;
import com.wealthos.auth.repository.InvestorAccountRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Seeds one demo account per role table so the login page's "Use demo credentials" button and
// existing manual testing keep working once real per-role validation replaces the old
// any-email-works fallback. Every role's demo password is "demo1234".
@Configuration
public class DemoAccountSeeder {

    @Bean
    public CommandLineRunner seedDemoAccounts(
            InvestorAccountRepository investorRepository,
            AdvisorAccountRepository advisorRepository,
            AdminAccountRepository adminRepository,
            InstitutionalAccountRepository institutionalRepository,
            FamilyOfficeAccountRepository familyOfficeRepository) {
        return args -> {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            if (investorRepository.count() == 0) {
                investorRepository.save(new InvestorAccount("CL-1013", "Hemant Hanumant Shinde", "hemantshinde307@gmail.com", encoder.encode("demo1234"), "+91 81080 75941"));
                investorRepository.save(new InvestorAccount("CL-DEMO01", "Aisha Kulkarni", "aisha.kulkarni@example.com", encoder.encode("demo1234"), "+91 90000 12121"));
            }

            if (advisorRepository.count() == 0) {
                advisorRepository.save(new AdvisorAccount("ADV-1001", "Amit Deshmukh", "amit.deshmukh@wealthos.com", encoder.encode("demo1234"), "+91 98200 55667"));
            }

            if (adminRepository.count() == 0) {
                adminRepository.save(new AdminAccount("ADM-1001", "Priya Nair", "admin@wealthos.com", encoder.encode("demo1234"), "+91 90220 11223"));
            }

            if (institutionalRepository.count() == 0) {
                institutionalRepository.save(new InstitutionalAccount("INS-1001", "Institutional Desk", "institutional@wealthos.com", encoder.encode("demo1234"), "+91 22 6688 4400"));
            }

            if (familyOfficeRepository.count() == 0) {
                familyOfficeRepository.save(new FamilyOfficeAccount("FO-1001", "Family Office Desk", "familyoffice@wealthos.com", encoder.encode("demo1234"), "+91 22 6688 4401"));
            }

            // Connect the two demo customers to the demo distributor so the in-app chat can be tried
            // straight away. Only fills in a missing link; a customer who linked someone else is left alone.
            advisorRepository.findByAccountCode("ADV-1001").ifPresent(advisor -> {
                for (String customerId : List.of("CL-DEMO01", "CL-1013")) {
                    investorRepository.findByCustomerId(customerId).ifPresent(investor -> {
                        if (investor.getDistributorCode() == null || investor.getDistributorCode().isBlank()) {
                            investor.setDistributorCode(advisor.getAccountCode());
                            investorRepository.save(investor);
                        }
                    });
                }
            });
        };
    }
}
